
const STORAGE_KEY = "whatif_saved_plans";

export function getSavedPlans() {
  try {
    const plans = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(plans) ? plans : [];
  } catch {
    return [];
  }
}

export function savePlan(plan) {
  if (!plan || typeof plan !== "object") {
    throw new Error("A valid plan is required.");
  }

  const plans = getSavedPlans();
  const id = String(
    plan.id ||
      `${plan.type || "plan"}-${plan.title || plan.name || Date.now()}`
  );

  const normalizedPlan = { ...plan, id };
  const existingIndex = plans.findIndex(
    (item) => String(item.id) === id
  );

  if (existingIndex >= 0) {
    plans[existingIndex] = normalizedPlan;
  } else {
    plans.unshift(normalizedPlan);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  return normalizedPlan;
}

export function removeSavedPlan(id) {
  const plans = getSavedPlans().filter(
    (plan) => String(plan.id) !== String(id)
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  return plans;
}

export function isPlanSaved(id) {
  return getSavedPlans().some(
    (plan) => String(plan.id) === String(id)
  );
}
