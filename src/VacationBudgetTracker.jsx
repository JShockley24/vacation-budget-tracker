import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const defaultCategories = [
  { name: 'Cruise', budget: '' },
  { name: 'Lodging', budget: '' },
  { name: 'Food', budget: '' },
  { name: 'Transportation', budget: '' },
  { name: 'Entertainment', budget: '' },
  { name: 'Shopping', budget: '' },
  { name: 'Misc', budget: '' }
];
const LOCAL_STORAGE_KEY = 'vacationBudgetTrackerData';

export default function VacationBudgetTracker() {
  const [categories, setCategories] = useState([...defaultCategories]);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ date: '', category: '', description: '', amount: '' });
  const [editingExpenseIndex, setEditingExpenseIndex] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    if (saved) {
      setCategories(saved.categories || [...defaultCategories]);
      setExpenses(saved.expenses || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ categories, expenses }));
  }, [categories, expenses]);

  const confirmReset = () => {
    setShowModal(true);
  };

  const cancelReset = () => {
    setShowModal(false);
  };

  const handleConfirmReset = () => {
    handleReset();
    setShowModal(false);
  };

  const handleAddExpense = () => {
    if (!newExpense.date || !newExpense.category || !newExpense.amount) return;
    setExpenses([...expenses, { ...newExpense, amount: parseFloat(newExpense.amount) }]);
    setNewExpense({ date: '', category: '', description: '', amount: '' });
  };

  const handleReset = () => {
    setExpenses([]);
    setCategories([...defaultCategories]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const handleEditExpense = (index) => {
    setEditingExpenseIndex(index);
    setEditingExpense({ ...expenses[index] });
  };

  const handleSaveExpense = () => {
    if (!editingExpense || !editingExpense.date || !editingExpense.category || editingExpense.amount === '' || isNaN(Number(editingExpense.amount))) {
      alert('Please fill out all fields with valid values before saving.');
      return;
    }

    const updatedExpenses = [...expenses];
    updatedExpenses[editingExpenseIndex] = {
      ...editingExpense,
      amount: parseFloat(editingExpense.amount)
    };
    setExpenses(updatedExpenses);
    setEditingExpenseIndex(null);
    setEditingExpense(null);
  };

  const handleDeleteExpense = (index) => {
    const updatedExpenses = expenses.filter((_, i) => i !== index);
    setExpenses(updatedExpenses);
  };

  const totalCategoryBudget = categories.reduce((sum, cat) => sum + parseFloat(cat.budget || 0), 0);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = totalCategoryBudget - totalSpent;
  const chartData = categories.map(cat => ({
    name: cat.name,
    value: expenses.filter(e => e.category === cat.name).reduce((sum, e) => sum + e.amount, 0)
  })).filter(item => item.value > 0);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#a4de6c', '#d0ed57'];

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <h1>Vacation Budget Tracker</h1>

      <h2>Add Expense</h2>
      <div>
        <input type="date" value={newExpense.date} onChange={e => setNewExpense({ ...newExpense, date: e.target.value })} />
        <select value={newExpense.category} onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}>
          <option value="">Select Category</option>
          {categories.map((cat, i) => <option key={i} value={cat.name}>{cat.name}</option>)}
        </select>
        <input placeholder="Description" value={newExpense.description} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })} />
        <input type="number" placeholder="Amount" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} />
        <button onClick={handleAddExpense}>Add</button>
      </div>

      <h2>Expenses</h2>
      <ul>
        {expenses.map((e, i) => (
          <li key={i}>
            {editingExpenseIndex === i ? (
              <>
                <input
                  type="date"
                  value={editingExpense.date}
                  onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
                />
                <select
                  value={editingExpense.category}
                  onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <input
                  placeholder="Description"
                  value={editingExpense.description}
                  onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={editingExpense.amount}
                  onChange={(e) => setEditingExpense({ ...editingExpense, amount: e.target.value })}
                />
                <button onClick={handleSaveExpense}>Save</button>
                <button onClick={() => { setEditingExpenseIndex(null); setEditingExpense(null); }}>Cancel</button>
              </>
            ) : (
              <>
                {e.date} | {e.category} | {e.description} - ${e.amount.toFixed(2)}
                <button onClick={() => handleEditExpense(i)}>Edit</button>
                <button onClick={() => handleDeleteExpense(i)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>

      <h2>Summary</h2>
      <p>Total Budget: ${totalCategoryBudget.toFixed(2)}</p>
      <p>Spent: ${totalSpent.toFixed(2)}</p>
      <p>Remaining: ${remaining.toFixed(2)}</p>

      <h2>Spending Breakdown</h2>
      {chartData.length === 0 ? <p>No spending yet.</p> : (
        <PieChart width={400} height={300}>
          <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={100}>
            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      )}

      <h2>Category Spending</h2>
      <ul>
        {categories.map((cat, i) => {
          const spent = expenses.filter(e => e.category === cat.name).reduce((sum, e) => sum + e.amount, 0);
          const catBudget = parseFloat(cat.budget || 0);
          const catRemaining = catBudget - spent;
          return (
            <li key={i}>
              <strong>{cat.name}</strong>: 
              Spent: ${spent.toFixed(2)}
              | Budget: ${catBudget.toFixed(2)}
              | Remaining: <span style={{ color: catRemaining < 0 ? 'red' : 'inherit' }}>${catRemaining.toFixed(2)}</span>
            </li>
          );
        })}
      </ul>

      <div style={{ marginTop: '2em', borderTop: '1px solid #ccc', paddingTop: '1em' }}>
        <h2>Set Category Budgets</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.5em', borderBottom: '1px solid #ccc' }}>Category</th>
              <th style={{ textAlign: 'left', padding: '0.5em', borderBottom: '1px solid #ccc' }}>Budget</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => (
              <tr key={i}>
                <td style={{ padding: '0.5em', borderBottom: '1px solid #eee' }}><strong>{cat.name}</strong></td>
                <td style={{ padding: '0.5em', borderBottom: '1px solid #eee' }}>
                  <input
                    type="number"
                    placeholder="Budget"
                    value={cat.budget}
                    onChange={e => {
                      const updated = [...categories];
                      updated[i].budget = e.target.value;
                      setCategories(updated);
                    }}
                    style={{ width: '100px' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="reset-button-container">
        <button className="reset-button" onClick={confirmReset}>Reset</button>
      </div>

      {showModal && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Are you sure you want to reset?</h3>
          <p>This will delete all your vacation data from this device.</p>
          <button onClick={handleConfirmReset}>Yes, Reset</button>
          <button onClick={cancelReset}>Cancel</button>
        </div>
      </div>
      )}

    </div>
  );
}