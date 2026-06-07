  /**
   * script.js — DecodeLabs Project 3 · Interactive Web Elements
   *
   * Engineering Standards (PDF page 17):
   *   - js-  prefix : JavaScript hooks (never styled with CSS)
   *   - is-  prefix : Visual state classes (toggled by JS, styled by CSS)
   *   - const        : DOM references that never reassign
   *   - let          : Mutable state values
   *   - NO var       : Legacy — never used
   *   - textContent  : Safe DOM text injection (never innerHTML — XSS risk)
   *   - Functions    : Small and single-purpose
   *
   * Every feature follows the IPO loop (PDF page 7):
   *   INPUT  → User event (click, input, keydown)
   *   PROCESS → JS logic (evaluate state, calculate next step)
   *   OUTPUT → DOM mutation (classList.toggle, textContent, appendChild)
   */

  'use strict';

  /* ============================================================
    FEATURE 1: DARK MODE TOGGLE
    Case Study from PDF page 16
    INPUT  : User clicks the theme toggle button
    PROCESS : JS checks current theme state, flips it, saves to localStorage
    OUTPUT : data-theme attribute on <html> changes — CSS variables cascade
  ============================================================ */

  const themeToggleBtn = document.querySelector('.js-theme-toggle');

  // Read saved preference or default to dark
  let isDark = localStorage.getItem('dl-theme') !== 'light';

  /** Apply the current isDark state to the document */
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    // textContent only — never innerHTML
    themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
    themeToggleBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  /** Toggle theme state, persist, and apply */
  function toggleTheme() {
    isDark = !isDark;
    localStorage.setItem('dl-theme', isDark ? 'dark' : 'light');
    applyTheme();
    showToast(isDark ? '🌙 Dark mode on' : '☀️ Light mode on');
  }

  // Wire the event listener
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Apply on page load
  applyTheme();


  /* ============================================================
    FEATURE 2: TAB SWITCHER
    INPUT  : User clicks a tab button
    PROCESS : Find which tab was clicked, remove is-active from all
    OUTPUT : Correct tab panel shown, correct button highlighted
  ============================================================ */

  const tabBtns   = document.querySelectorAll('.js-tab-btn');
  const tabPanels = document.querySelectorAll('.js-tab-panel');

  /**
   * Activate the tab matching targetId
   * @param {string} targetId - The data-tab / id value
   */
  function switchTab(targetId) {
    // Process: update button states
    tabBtns.forEach(btn => {
      const isActive = btn.dataset.tab === targetId;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

    // Output: show correct panel, hide others
    tabPanels.forEach(panel => {
      const isActive = panel.id === targetId;
      panel.classList.toggle('is-active', isActive);
      // Use hidden attribute for accessibility (screen readers skip hidden panels)
      if (isActive) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });
  }

  // Wire all tab buttons with a single handler pattern
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });


  /* ============================================================
    FEATURE 3: ACCORDION
    INPUT  : User clicks an accordion button
    PROCESS : Check if item is already open, close all, open clicked one
    OUTPUT : is-open class toggled — CSS max-height transition runs
  ============================================================ */

  const accordionItems = document.querySelectorAll('.js-accordion-item');

  /**
   * Toggle a single accordion item
   * @param {HTMLElement} clickedItem - The item whose button was clicked
   */
  function toggleAccordion(clickedItem) {
    const isAlreadyOpen = clickedItem.classList.contains('is-open');

    // Close all items first
    accordionItems.forEach(item => {
      item.classList.remove('is-open');
      item.querySelector('.js-accordion-btn').setAttribute('aria-expanded', 'false');
    });

    // Open the clicked item if it was closed
    if (!isAlreadyOpen) {
      clickedItem.classList.add('is-open');
      clickedItem.querySelector('.js-accordion-btn').setAttribute('aria-expanded', 'true');
    }
  }

  // Wire each accordion button
  accordionItems.forEach(item => {
    const btn = item.querySelector('.js-accordion-btn');
    btn.addEventListener('click', () => toggleAccordion(item));
  });


  /* ============================================================
    FEATURE 4: CHARACTER COUNTER
    INPUT  : User types in the textarea
    PROCESS : Calculate length, compare to limit, determine warning level
    OUTPUT : textContent of counter updated; is-warning / is-error classes toggled
  ============================================================ */

  const textarea  = document.querySelector('.js-textarea');
  const charCount = document.querySelector('.js-char-count');
  const clearBtn  = document.querySelector('.js-clear-textarea');
  const MAX_CHARS = 150;

  /** Update the character count display */
  function updateCharCount() {
    const len = textarea.value.length;

    // Output: safe textContent update
    charCount.textContent = `${len} / ${MAX_CHARS}`;

    // Output: toggle state classes based on thresholds
    charCount.classList.toggle('is-warning', len >= Math.floor(MAX_CHARS * 0.8) && len < MAX_CHARS);
    charCount.classList.toggle('is-error',   len >= MAX_CHARS);
  }

  /** Clear the textarea and reset counter */
  function clearTextarea() {
    textarea.value = '';
    updateCharCount();
    textarea.focus();
  }

  textarea.addEventListener('input', updateCharCount);
  clearBtn.addEventListener('click', clearTextarea);


  /* ============================================================
    FEATURE 5: DYNAMIC TASK LIST
    INPUT  : User clicks Add or presses Enter
    PROCESS : Validate input, build new DOM nodes with createElement
    OUTPUT : New task item appended via appendChild; empty state toggled
  ============================================================ */

  const taskInput   = document.querySelector('.js-task-input');
  const addTaskBtn  = document.querySelector('.js-add-task');
  const taskList    = document.querySelector('.js-task-list');
  const taskEmpty   = document.querySelector('.js-task-empty');
  const taskCounter = document.querySelector('.js-task-count');
  const clearAllBtn = document.querySelector('.js-clear-tasks');

  // Mutable state — let because it changes
  let taskCount = 0;

  /** Update the task count display and empty state */
  function updateTaskUI() {
    const items = taskList.querySelectorAll('.task-item');
    const count = items.length;

    // Output: textContent only — never innerHTML
    taskCounter.textContent = count === 1 ? '1 task' : `${count} tasks`;

    // Toggle empty state visibility
    taskEmpty.classList.toggle('is-hidden', count > 0);
  }

  /**
   * Build a single task <li> element using createElement
   * @param {string} text - The task text
   * @returns {HTMLElement} - The complete <li> node
   */
  function createTaskNode(text) {
    // document.createElement — page 14
    const li       = document.createElement('li');
    const checkbox = document.createElement('input');
    const span     = document.createElement('span');
    const delBtn   = document.createElement('button');

    li.className       = 'task-item';

    checkbox.type      = 'checkbox';
    checkbox.className = 'task-item__checkbox';
    checkbox.setAttribute('aria-label', `Mark complete: ${text}`);

    span.className     = 'task-item__text';
    span.textContent   = text; // textContent — safe, no XSS risk

    delBtn.type        = 'button';
    delBtn.className   = 'task-item__delete';
    delBtn.textContent = '✕';             // textContent only
    delBtn.setAttribute('aria-label', `Delete task: ${text}`);

    // Wire checkbox: toggle is-done state class
    checkbox.addEventListener('change', () => {
      li.classList.toggle('is-done', checkbox.checked);
    });

    // Wire delete button: animate out then remove node
    delBtn.addEventListener('click', () => removeTask(li));

    // Build the node tree — appendChild (page 14)
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(delBtn);

    return li;
  }

  /**
   * Add a new task from the input field
   */
  function addTask() {
    const text = taskInput.value.trim();

    // Process: validate
    if (!text) {
      taskInput.focus();
      showToast('⚠️ Please enter a task first.');
      return;
    }

    taskCount++;

    // Output: create node and append to list
    const node = createTaskNode(text);
    taskList.appendChild(node); // appendChild — page 14

    // Reset input
    taskInput.value = '';
    taskInput.focus();

    updateTaskUI();
    showToast(`✅ Task added!`);
  }

  /**
   * Animate and remove a task node
   * @param {HTMLElement} li - The task item to remove
   */
  function removeTask(li) {
    // Output: add is-removing for CSS transition, then remove from DOM
    li.classList.add('is-removing');
    setTimeout(() => {
      li.remove();
      updateTaskUI();
    }, 250);
  }

  /** Clear all tasks from the list */
  function clearAllTasks() {
    if (taskList.children.length === 0) return;

    // Remove all children one by one for animation
    Array.from(taskList.children).forEach((li, i) => {
      setTimeout(() => li.classList.add('is-removing'), i * 60);
    });

    setTimeout(() => {
      taskList.innerHTML = '';  // Safe — no user data, clearing own nodes
      updateTaskUI();
      showToast('🗑️ All tasks cleared.');
    }, taskList.children.length * 60 + 260);
  }

  // Wire event listeners
  addTaskBtn.addEventListener('click', addTask);
  clearAllBtn.addEventListener('click', clearAllTasks);

  // Allow pressing Enter to add a task
  taskInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
  });

  // Initialise UI
  updateTaskUI();


  /* ============================================================
    UTILITY: TOAST NOTIFICATION
    Demonstrates: createElement, appendChild, auto-removal
    INPUT  : Any feature calls showToast(message)
    PROCESS : Build toast node, append to container
    OUTPUT : Toast appears and auto-removes after 3s
  ============================================================ */

  const toastContainer = document.querySelector('.js-toast-container');

  /**
   * Show a toast notification
   * @param {string} message - The message to display
   * @param {number} duration - Auto-dismiss delay in ms (default 3000)
   */
  function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className  = 'toast';
    toast.textContent = message; // textContent — safe injection

    toastContainer.appendChild(toast);

    // Auto-remove after duration
    setTimeout(() => {
      toast.classList.add('is-removing');
      // Remove node after CSS animation completes
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
