let totals = {
    housing: 0, utilities: 0, food: 0, transportation: 0,
    education: 0, health: 0, subscription: 0, pets: 0
};

let budgetHistory = [];
let currentHistoryIndex = null;

// Add Expense Logic
function addExpense(type, prefix = "") {
    const nameInput = document.getElementById(prefix + type + "Name");
    const amountInput = document.getElementById(prefix + type + "Amount");
    
    // If in modal and not in edit mode, block adding
    if (prefix === "edit-" && document.getElementById('editBtn').style.display !== 'none') {
        alert("Please click 'Edit Record' first.");
        return;
    }

    let name = nameInput.value;
    let amount = parseFloat(amountInput.value);

    if (!name || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid name and amount.");
        return;
    }

    const table = document.getElementById(prefix + type + "Table");
    const row = table.insertRow();
    row.innerHTML = `<td>${name}</td><td>₱${amount.toFixed(2)}</td>`;

    // Reset inputs
    nameInput.value = "";
    amountInput.value = "";

    // Update the visual totals
    recalculateUI(prefix);
}

// Function to calculate totals from UI tables
function recalculateUI(prefix = "") {
    let grandTotal = 0;
    const cats = Object.keys(totals);

    cats.forEach(cat => {
        let catTotal = 0;
        const table = document.getElementById(prefix + cat + "Table");
        Array.from(table.rows).forEach(row => {
            let val = parseFloat(row.cells[1].innerText.replace('₱', ''));
            catTotal += val;
        });
        
        document.getElementById(prefix + cat + "Total").innerText = catTotal.toFixed(2);
        grandTotal += catTotal;
    });

    // Update Top Summary
    const income = parseFloat(document.getElementById(prefix + "income").value) || 0;
    const percent = parseFloat(document.getElementById(prefix + "savingsPercent").value) || 0;
    const savings = income * (percent / 100);

    if (prefix === "") {
        document.getElementById("totalExpenses").value = grandTotal.toFixed(2);
        document.getElementById("remaining").value = (income - grandTotal - savings).toFixed(2);
    }
}

// Global listeners for main dashboard
document.getElementById("income").addEventListener("input", () => recalculateUI(""));
document.getElementById("savingsPercent").addEventListener("input", () => recalculateUI(""));

function toggleHistory() {
    const section = document.getElementById("historySection");
    section.style.display = section.style.display === "none" ? "block" : "none";
    if (section.style.display === "block") loadHistory();
}

function saveBudget() {
    const income = parseFloat(document.getElementById("income").value) || 0;
    const percent = parseFloat(document.getElementById("savingsPercent").value) || 0;
    
    let record = {
        date: new Date().toLocaleString(),
        income: income,
        savingsPercent: percent,
        items: {}
    };

    Object.keys(totals).forEach(cat => {
        record.items[cat] = [];
        const rows = document.getElementById(cat + "Table").rows;
        Array.from(rows).forEach(row => {
            record.items[cat].push({
                name: row.cells[0].innerText,
                amount: parseFloat(row.cells[1].innerText.replace('₱', ''))
            });
        });
    });

    budgetHistory.push(record);
    alert("Record Saved Successfully!");
    loadHistory();
}

function loadHistory() {
    const list = document.getElementById("historyList");
    list.innerHTML = "";
    budgetHistory.forEach((item, index) => {
        const btn = document.createElement("button");
        btn.className = "list-group-item list-group-item-action d-flex justify-content-between";
        btn.innerHTML = `<span>${item.date}</span> <span class="badge bg-primary rounded-pill">₱${item.income}</span>`;
        btn.onclick = () => openHistory(index);
        list.appendChild(btn);
    });
}

function openHistory(index) {
    currentHistoryIndex = index;
    const item = budgetHistory[index];
    
    // Reset Modal Buttons
    document.getElementById("editBtn").style.display = "inline-block";
    document.getElementById("saveBtn").style.display = "none";

    let html = `
        <div class="row mb-3">
            <div class="col-6">
                <label>Income</label>
                <input id="edit-income" type="number" class="form-control" value="${item.income}" readonly>
            </div>
            <div class="col-6">
                <label>Savings %</label>
                <input id="edit-savingsPercent" type="number" class="form-control" value="${item.savingsPercent}" readonly>
            </div>
        </div>
        <div class="row g-2">`;

    Object.keys(totals).forEach(cat => {
        html += `
            <div class="col-md-6">
                <div class="border p-2 rounded">
                    <strong class="text-capitalize">${cat}</strong>
                    <div class="edit-controls d-none">
                        <input id="edit-${cat}Name" class="form-control form-control-sm mb-1" placeholder="Item">
                        <input id="edit-${cat}Amount" type="number" class="form-control form-control-sm mb-1" placeholder="Amount">
                        <button class="btn btn-success btn-sm w-100 mb-2" onclick="addExpense('${cat}', 'edit-')">Add</button>
                    </div>
                    <table class="table table-sm mb-1">
                        <tbody id="edit-${cat}Table">
                            ${item.items[cat].map(i => `<tr><td>${i.name}</td><td>₱${i.amount.toFixed(2)}</td></tr>`).join('')}
                        </tbody>
                    </table>
                    <small>Total: ₱<span id="edit-${cat}Total">0</span></small>
                </div>
            </div>`;
    });

    html += `</div>`;
    document.getElementById("modalContent").innerHTML = html;
    
    // Initial Calculation for Modal
    setTimeout(() => recalculateUI("edit-"), 100);

    const myModal = new bootstrap.Modal(document.getElementById('historyModal'));
    myModal.show();
}

function enableEdit() {
    // Show hidden inputs and remove readonly
    document.getElementById("edit-income").removeAttribute("readonly");
    document.getElementById("edit-savingsPercent").removeAttribute("readonly");
    
    document.querySelectorAll(".edit-controls").forEach(el => el.classList.remove("d-none"));
    
    document.getElementById("editBtn").style.display = "none";
    document.getElementById("saveBtn").style.display = "inline-block";
}

function saveEditedHistory() {
    const idx = currentHistoryIndex;
    const income = parseFloat(document.getElementById("edit-income").value) || 0;
    const percent = parseFloat(document.getElementById("edit-savingsPercent").value) || 0;

    let updatedItems = {};
    Object.keys(totals).forEach(cat => {
        updatedItems[cat] = [];
        const rows = document.getElementById(`edit-${cat}Table`).rows;
        Array.from(rows).forEach(row => {
            updatedItems[cat].push({
                name: row.cells[0].innerText,
                amount: parseFloat(row.cells[1].innerText.replace('₱', ''))
            });
        });
    });

    // Update History Array
    budgetHistory[idx].income = income;
    budgetHistory[idx].savingsPercent = percent;
    budgetHistory[idx].items = updatedItems;

    alert("Changes Saved!");
    bootstrap.Modal.getInstance(document.getElementById('historyModal')).hide();
    loadHistory();
}