export default class BudgetTracker {
    constructor(querySelectorString){
        this.root=document.querySelector(querySelectorString);
        this.root.innerHTML=BudgetTracker.html();

        this.root.querySelector(".new-entry").addEventListener("click",() => {
            this.onNewEntryBtnClick();
        })

        this.load();
    }

    static html(){
        return `
        <table class="budget-tracker">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Way of Payment</th>
                    <th>Amount</th>
                    <th class="delete"></th>
                </tr>
            </thead>
            <tbody class="entries"></tbody>
            <tbody>
                <tr>
                    <td colspan="6" class="controls">
                        <button type="button" class="new-entry">New Entry</button>
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr><td class="summary" colspan="6">
                    <strong>Total:</strong>
                    <span class="total">₹0.00</span>
                </td></tr>
            </tfoot>
        </table>
        `;

    }

    static entryHtml(){
        return `
        <tr>
        <td><input type="date" class="input input-date"></td>
        <td><input type="text" class="input input-description" placeholder="Ex:Paid to Ram for this..."></td>
        <td><select class="input input-type">
            <option value="income">Income</option>
            <option value="expense">Expense</option>
        </select>
        </td>
        <td><select class="input input-way-of-payment">
            <option value="online">Online</option>
            <option value="offline">Inhand or Offline</option>
        </select></td>
        <td><input type="number" class="input input-amount" placeholder="Amount"></td>
        <td>
            <button class="delete-entry">&#10005;</button>
        </td>
    </tr>

        `;

    }

    load(){
        const entries=JSON.parse(localStorage.getItem("budget-tracker-entries") || "[]");
        
        for(const entry of entries){
            this.addEntry(entry);
        }

        this.updateSummary();
    }

    updateSummary(){
        const total=this.getEntryRows().reduce((total,row) =>{
            const amount=row.querySelector(".input-amount").value;
            const isExpense=row.querySelector(".input-type").value === "expense";
            const modifier=isExpense ? -1 : 1;

            return total+(amount*modifier);
        },0)

        const totalFormated=new Intl.NumberFormat("en-IN",{
            style:"currency",
            currency:"INR"
        }).format(total);

        this.root.querySelector(".total").textContent=totalFormated;
    }

    save(){
        
        const data=this.getEntryRows().map(row=>{
            return {
                date:row.querySelector(".input-date").value,
                description:row.querySelector(".input-description").value,
                type:row.querySelector(".input-type").value,
                wayofpayment:row.querySelector(".input-way-of-payment").value,
                amount:parseFloat(row.querySelector(".input-amount").value)

            }
        })
        localStorage.setItem("budget-tracker-entries", JSON.stringify(data))
        this.updateSummary(); 

    }

    addEntry(entry={}){
        this.root.querySelector(".entries").insertAdjacentHTML("beforeend",BudgetTracker.entryHtml());
        
        const row=this.root.querySelector(".entries tr:last-of-type");

        row.querySelector(".input-date").value=entry.date || new Date().toISOString().replace(/T.*/,"");
        row.querySelector(".input-description").value=entry.description || "";
        row.querySelector(".input-type").value=entry.type || "income" ;
        row.querySelector(".input-way-of-payment").value=entry.wayofpayment || "offline";
        row.querySelector(".input-amount").value=entry.amount || 0;
        row.querySelector(".delete-entry").addEventListener("click", e => {
            this.onDeleteEntry(e);
        })

        row.querySelectorAll(".input").forEach(input => {
            input.addEventListener("change",() => this.save())
        })
            
       
    }

    getEntryRows(){
        return Array.from(this.root.querySelectorAll(".entries tr"))
    }

    onNewEntryBtnClick(){
        this.addEntry();
    }

    onDeleteEntry(e){
        e.target.closest("tr").remove();
        this.save();
    }
}