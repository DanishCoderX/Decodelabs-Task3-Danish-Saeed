'use strict';

const themeToggleBtn = document.querySelector('.js-theme-toggle');

let isDark = localStorage.getItem('dl-theme') !== 'light';

function applyTheme() {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
  themeToggleBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
}

function toggleTheme() {
  isDark = !isDark;
  localStorage.setItem('dl-theme', isDark ? 'dark' : 'light');
  applyTheme();
  showToast(isDark ? '🌙 Dark mode on' : '☀️ Light mode on');
}

themeToggleBtn.addEventListener('click', toggleTheme);

applyTheme();

const tabBtns   = document.querySelectorAll('.js-tab-btn');
const tabPanels = document.querySelectorAll('.js-tab-panel');

function switchTab(targetId) {
  tabBtns.forEach(btn => {
    const isActive = btn.dataset.tab === targetId;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-selected', String(isActive));
  });

  tabPanels.forEach(panel => {
    const isActive = panel.id === targetId;
    panel.classList.toggle('is-active', isActive);
    if (isActive) {
      panel.removeAttribute('hidden');
    } else {
      panel.setAttribute('hidden', '');
    }
  });
}

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

const accordionItems = document.querySelectorAll('.js-accordion-item');

function toggleAccordion(clickedItem) {
  const isAlreadyOpen = clickedItem.classList.contains('is-open');

  accordionItems.forEach(item => {
    item.classList.remove('is-open');
    item.querySelector('.js-accordion-btn').setAttribute('aria-expanded', 'false');
  });

  if (!isAlreadyOpen) {
    clickedItem.classList.add('is-open');
    clickedItem.querySelector('.js-accordion-btn').setAttribute('aria-expanded', 'true');
  }
}

accordionItems.forEach(item => {
  const btn = item.querySelector('.js-accordion-btn');
  btn.addEventListener('click', () => toggleAccordion(item));
});

const textarea  = document.querySelector('.js-textarea');
const charCount = document.querySelector('.js-char-count');
const clearBtn  = document.querySelector('.js-clear-textarea');
const MAX_CHARS = 150;

function updateCharCount() {
  const len = textarea.value.length;

  charCount.textContent = `${len} / ${MAX_CHARS}`;

  charCount.classList.toggle('is-warning', len >= Math.floor(MAX_CHARS * 0.8) && len < MAX_CHARS);
  charCount.classList.toggle('is-error',   len >= MAX_CHARS);
}

function clearTextarea() {
  textarea.value = '';
  updateCharCount();
  textarea.focus();
}

textarea.addEventListener('input', updateCharCount);
clearBtn.addEventListener('click', clearTextarea);

const taskInput   = document.querySelector('.js-task-input');
const addTaskBtn  = document.querySelector('.js-add-task');
const taskList    = document.querySelector('.js-task-list');
const taskEmpty   = document.querySelector('.js-task-empty');
const taskCounter = document.querySelector('.js-task-count');
const clearAllBtn = document.querySelector('.js-clear-tasks');

let taskCount = 0;

function updateTaskUI() {
  const items = taskList.querySelectorAll('.task-item');
  const count = items.length;

  taskCounter.textContent = count === 1 ? '1 task' : `${count} tasks`;

  taskEmpty.classList.toggle('is-hidden', count > 0);
}

function createTaskNode(text) {
  const li       = document.createElement('li');
  const checkbox = document.createElement('input');
  const span     = document.createElement('span');
  const delBtn   = document.createElement('button');

  li.className       = 'task-item';

  checkbox.type      = 'checkbox';
  checkbox.className = 'task-item__checkbox';
  checkbox.setAttribute('aria-label', `Mark complete: ${text}`);

  span.className     = 'task-item__text';
  span.textContent   = text;

  delBtn.type        = 'button';
  delBtn.className   = 'task-item__delete';
  delBtn.textContent = '✕';
  delBtn.setAttribute('aria-label', `Delete task: ${text}`);

  checkbox.addEventListener('change', () => {
    li.classList.toggle('is-done', checkbox.checked);
  });

  delBtn.addEventListener('click', () => removeTask(li));

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(delBtn);

  return li;
}

function addTask() {
  const text = taskInput.value.trim();

  if (!text) {
    taskInput.focus();
    showToast('⚠️ Please enter a task first.');
    return;
  }

  taskCount++;

  const node = createTaskNode(text);
  taskList.appendChild(node);

  taskInput.value = '';
  taskInput.focus();

  updateTaskUI();
  showToast(`✅ Task added!`);
}

function removeTask(li) {
  li.classList.add('is-removing');
  setTimeout(() => {
    li.remove();
    updateTaskUI();
  }, 250);
}

function clearAllTasks() {
  if (taskList.children.length === 0) return;

  Array.from(taskList.children).forEach((li, i) => {
    setTimeout(() => li.classList.add('is-removing'), i * 60);
  });

  setTimeout(() => {
    taskList.innerHTML = '';
    updateTaskUI();
    showToast('🗑️ All tasks cleared.');
  }, taskList.children.length * 60 + 260);
}

addTaskBtn.addEventListener('click', addTask);
clearAllBtn.addEventListener('click', clearAllTasks);

taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

updateTaskUI();

const toastContainer = document.querySelector('.js-toast-container');

function showToast(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className  = 'toast';
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('is-removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
