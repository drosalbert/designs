import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

const els = {
  authView: document.getElementById("auth-view"),
  appView: document.getElementById("app-view"),
  authForm: document.getElementById("auth-form"),
  authMessage: document.getElementById("auth-message"),
  email: document.getElementById("email"),
  password: document.getElementById("password"),
  signOut: document.getElementById("sign-out"),
  configWarning: document.getElementById("config-warning"),
  tripForm: document.getElementById("trip-form"),
  tripDate: document.getElementById("trip-date"),
  tripStart: document.getElementById("trip-start"),
  tripEnd: document.getElementById("trip-end"),
  tripDistance: document.getElementById("trip-distance"),
  tripList: document.getElementById("trip-list"),
  tripCount: document.getElementById("trip-count"),
  tripTotal: document.getElementById("trip-total"),
};

const isConfigured =
  SUPABASE_URL && SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes("YOUR_") && !SUPABASE_ANON_KEY.includes("YOUR_");

if (!isConfigured) {
  els.configWarning.hidden = false;
  els.authForm.querySelectorAll("button").forEach((b) => (b.disabled = true));
}

const supabase = isConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let authMode = "signin";
els.authForm.querySelectorAll("button[data-mode]").forEach((btn) => {
  btn.addEventListener("click", () => { authMode = btn.dataset.mode; });
});

els.authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!supabase) return;
  setAuthMessage("");
  const email = els.email.value.trim();
  const password = els.password.value;
  const fn = authMode === "signup" ? "signUp" : "signInWithPassword";
  const { error } = await supabase.auth[fn]({ email, password });
  if (error) {
    setAuthMessage(error.message, true);
  } else if (authMode === "signup") {
    setAuthMessage("Account created. If email confirmation is on, check your inbox before signing in.");
  }
});

els.signOut.addEventListener("click", async () => {
  if (!supabase) return;
  await supabase.auth.signOut();
});

els.tripForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!supabase) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const trip = {
    user_id: user.id,
    trip_date: els.tripDate.value,
    start_location: els.tripStart.value.trim(),
    end_location: els.tripEnd.value.trim(),
    distance_km: parseFloat(els.tripDistance.value),
  };
  const { error } = await supabase.from("trips").insert(trip);
  if (error) {
    alert(error.message);
    return;
  }
  els.tripForm.reset();
  setDefaultDate();
  await loadTrips();
});

async function loadTrips() {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .order("trip_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) {
    els.tripList.innerHTML = "";
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = error.message;
    els.tripList.appendChild(li);
    return;
  }
  renderTrips(data ?? []);
}

function renderTrips(trips) {
  els.tripCount.textContent = `${trips.length} trip${trips.length === 1 ? "" : "s"}`;
  const total = trips.reduce((sum, t) => sum + Number(t.distance_km), 0);
  els.tripTotal.textContent = `${total.toFixed(1)} km`;

  els.tripList.innerHTML = "";

  if (trips.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "No trips yet. Add your first one above.";
    els.tripList.appendChild(li);
    return;
  }

  for (const t of trips) {
    const li = document.createElement("li");
    li.className = "trip";

    const top = document.createElement("div");
    top.className = "trip-top";
    const route = document.createElement("span");
    route.className = "trip-route";
    route.textContent = `${t.start_location} → ${t.end_location}`;
    const distance = document.createElement("span");
    distance.className = "trip-distance";
    distance.textContent = `${Number(t.distance_km).toFixed(1)} km`;
    top.append(route, distance);

    const date = document.createElement("div");
    date.className = "trip-date";
    date.textContent = formatDate(t.trip_date);

    const actions = document.createElement("div");
    actions.className = "trip-actions";
    const del = document.createElement("button");
    del.type = "button";
    del.className = "trip-delete";
    del.textContent = "Delete";
    del.addEventListener("click", () => deleteTrip(t.id));
    actions.appendChild(del);

    li.append(top, date, actions);
    els.tripList.appendChild(li);
  }
}

async function deleteTrip(id) {
  if (!supabase) return;
  if (!confirm("Delete this trip?")) return;
  const { error } = await supabase.from("trips").delete().eq("id", id);
  if (error) {
    alert(error.message);
    return;
  }
  await loadTrips();
}

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
  });
}

function setAuthMessage(text, isError = false) {
  els.authMessage.textContent = text;
  els.authMessage.classList.toggle("error", isError);
}

function setDefaultDate() {
  els.tripDate.value = new Date().toISOString().slice(0, 10);
}

function renderAuthState(session) {
  const signedIn = !!session;
  els.authView.hidden = signedIn;
  els.appView.hidden = !signedIn;
  els.signOut.hidden = !signedIn;
  if (signedIn) {
    setDefaultDate();
    loadTrips();
  }
}

if (supabase) {
  supabase.auth.onAuthStateChange((_event, session) => renderAuthState(session));
  const { data: { session } } = await supabase.auth.getSession();
  renderAuthState(session);
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}
