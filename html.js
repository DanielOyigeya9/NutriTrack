
const categories = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack"
];

const icons = {
  Breakfast: "🍳",
  Lunch: "🍲",
  Dinner: "🍽️",
  Snack: "🍌"
};

let meals = JSON.parse(
  localStorage.getItem("nutritrackMeals") || "[]"
);

let water = Number(
  localStorage.getItem("nutritrackWater") || 0
);

const $ = id => document.getElementById(id);

function save() {
  localStorage.setItem(
    "nutritrackMeals",
    JSON.stringify(meals)
  );

  localStorage.setItem(
    "nutritrackWater",
    String(water)
  );
}

function render() {

  const totals = meals.reduce((a, m) => ({
    cal: a.cal + m.cal,
    protein: a.protein + m.protein,
    carbs: a.carbs + m.carbs,
    fat: a.fat + m.fat
  }), {
    cal: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  $("calories").textContent =
    Math.round(totals.cal).toLocaleString();

  $("remaining").textContent =
    Math.max(0, 2000 - Math.round(totals.cal))
      .toLocaleString();

  $("calorieCaption").textContent =
    totals.cal > 2000
      ? "Above the example reference. No judgement."
      : "kcal left against the example reference";

  $("protein").textContent =
    Math.round(totals.protein) + " g";

  $("carbs").textContent =
    Math.round(totals.carbs) + " g";

  $("fat").textContent =
    Math.round(totals.fat) + " g";

  $("water").textContent =
    water.toLocaleString();

  $("waterFill").style.width =
    Math.min(100, water / 2000 * 100) + "%";

  $("mealCount").textContent =
    meals.length + " meals today";

  $("mealCards").innerHTML = categories.map(cat => {

    const items = meals
      .map((m, i) => ({ ...m, index: i }))
      .filter(m => m.type === cat);

    const total = items.reduce(
      (sum, m) => sum + m.cal,
      0
    );

    return `
      <article class="meal-card">

        <div class="meal-icon">
          ${icons[cat]}
        </div>

        <h3>${cat}</h3>

        <p>${items.length} items added</p>

        <div class="meal-total">
          ${Math.round(total)}
          <small>kcal logged</small>
        </div>

        <div class="meal-list">

          ${items.length
            ? items.map(m => `
              <div>
                <span>${escapeHtml(m.name)}</span>

                <span>
                  ${Math.round(m.cal)} kcal

                  <button
                    onclick="removeMeal(${m.index})"
                    aria-label="Remove food"
                  >×</button>
                </span>
              </div>
            `).join("")
            : '<div>No food logged yet.</div>'
          }

        </div>

      </article>
    `;

  }).join("");
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

window.removeMeal = function(index) {
  meals.splice(index, 1);
  save();
  render();
};

$("foodForm").addEventListener("submit", function(e) {

  e.preventDefault();

  const name = $("foodName").value.trim();
  const cal = Number($("foodCalories").value);

  if (!name || !Number.isFinite(cal) || cal < 0) {
    return;
  }

  meals.push({
    name: name,
    type: $("mealType").value,
    cal: cal,
    protein: Number($("foodProtein").value) || 0,
    carbs: Number($("foodCarbs").value) || 0,
    fat: Number($("foodFat").value) || 0
  });

  save();
  render();

  e.target.reset();

  $("foodProtein").value = 0;
  $("foodCarbs").value = 0;
  $("foodFat").value = 0;

});

$("addWater").addEventListener("click", function() {
  water = Math.min(10000, water + 250);
  save();
  render();
});

$("resetWater").addEventListener("click", function() {
  water = 0;
  save();
  render();
});

render();
