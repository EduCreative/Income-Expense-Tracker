// Configuration
const scriptUrl =
  "https://script.google.com/macros/s/AKfycbz-ZhiwVZfsGvhKIf6YnInbSsjXWNz0XDTKi_z0RpvsFNh45FrN__uN68xxv20fhj60dg/exec"; // You'll get this in Step 4

// DOM Elements
const transactionsList = document.getElementById("transactions-list");
const incomeTotal = document.getElementById("income-total");
const expenseTotal = document.getElementById("expense-total");
const balanceTotal = document.getElementById("balance-total");

// Categories
const incomeCategories = [
  "Salary",
  "Freelance",
  "Gift",
  "Investment",
  "Other Income",
];
const expenseCategories = [
  "Food",
  "Transport",
  "Rent",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Shopping",
  "Other Expense",
];
const transferCategories = ["Account Transfer", "Savings"];

// Initialize the app
document.addEventListener("DOMContentLoaded", function () {
  loadTransactions();
});

// Load transactions from Google Sheets
function loadTransactions() {
  fetch(scriptUrl + "?action=getTransactions")
    .then((response) => response.json())
    .then((data) => {
      displayTransactions(data);
      calculateTotals(data);
    })
    .catch((error) => console.error("Error:", error));
}

// Display transactions in the list
function displayTransactions(transactions) {
  transactionsList.innerHTML = "";

  transactions.forEach((transaction) => {
    const transactionCard = document.createElement("div");
    transactionCard.className = `transaction-card card ${
      transaction.type === "Income" ? "border-success" : "border-danger"
    }`;

    transactionCard.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between">
                    <h5 class="card-title">${transaction.category}</h5>
                    <span class="${
                      transaction.type === "Income"
                        ? "text-success"
                        : "text-danger"
                    }">
                        ${transaction.type === "Income" ? "+" : "-"}$${
      transaction.amount
    }
                    </span>
                </div>
                <h6 class="card-subtitle mb-2 text-muted">${
                  transaction.date
                } • ${transaction.method}</h6>
                <p class="card-text">${transaction.notes || ""}</p>
            </div>
        `;

    transactionsList.appendChild(transactionCard);
  });
}

// Calculate and display totals
function calculateTotals(transactions) {
  let income = 0;
  let expense = 0;

  transactions.forEach((transaction) => {
    if (transaction.type === "Income") {
      income += parseFloat(transaction.amount);
    } else if (transaction.type === "Expense") {
      expense += parseFloat(transaction.amount);
    }
  });

  incomeTotal.textContent = "$" + income.toFixed(2);
  expenseTotal.textContent = "$" + expense.toFixed(2);
  balanceTotal.textContent = "$" + (income - expense).toFixed(2);
}

// Show add transaction form
function showAddForm(type) {
  document.getElementById("transaction-type").value = type;
  document.getElementById("form-title").textContent = `Add ${type}`;

  const categorySelect = document.getElementById("transaction-category");
  categorySelect.innerHTML = "";

  const categories =
    type === "Income"
      ? incomeCategories
      : type === "Expense"
      ? expenseCategories
      : transferCategories;

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  document.getElementById("add-form").style.display = "block";
}

// Hide add transaction form
function hideAddForm() {
  document.getElementById("add-form").style.display = "none";
  document.getElementById("transaction-form").reset();
}

// Handle form submission
document
  .getElementById("transaction-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const transaction = {
      date: document.getElementById("transaction-date").value,
      type: document.getElementById("transaction-type").value,
      category: document.getElementById("transaction-category").value,
      amount: document.getElementById("transaction-amount").value,
      method: document.getElementById("transaction-method").value,
      notes: document.getElementById("transaction-notes").value,
    };

    // Add to Google Sheets
    fetch(scriptUrl + "?action=addTransaction", {
      method: "POST",
      body: JSON.stringify(transaction),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          loadTransactions();
          hideAddForm();
        }
      })
      .catch((error) => console.error("Error:", error));
  });
