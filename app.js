/**
 * TaskMaster Pro - Dashboard Application Logic
 * Pure Vanilla JavaScript with Web Storage (localStorage)
 * Zero external frameworks, zero CSS variables, zero Tailwind.
 */

(function () {
  "use strict";

  // Storage Key
  const STORAGE_KEY = "taskmaster_dashboard_tasks_v1";

  // State object
  const state = {
    tasks: [],
    viewFilter: "all", // all | today | important | in-progress | completed
    categoryFilter: "all", // all | Work | Personal | Study | Health | Finance
    priorityFilter: "all", // all | high | medium | low
    statusFilter: "all", // all | todo | in-progress | completed
    searchQuery: "",
    sortBy: "dueDateAsc", // dueDateAsc | dueDateDesc | priority | createdDesc | titleAsc
    currentDisplay: "list", // list | board
    taskPendingDeleteId: null,
    draggedTaskId: null
  };

  // DOM Elements Cache
  const elements = {
    // Topbar
    currentDateDisplay: document.getElementById("currentDateDisplay"),
    searchInput: document.getElementById("searchInput"),
    searchClearBtn: document.getElementById("searchClearBtn"),
    openNewTaskModalBtn: document.getElementById("openNewTaskModalBtn"),
    openSidebarBtn: document.getElementById("openSidebarBtn"),
    closeSidebarBtn: document.getElementById("closeSidebarBtn"),
    sidebar: document.getElementById("sidebar"),
    sidebarBackdrop: document.getElementById("sidebarBackdrop"),

    // Titles
    activeViewTitle: document.getElementById("activeViewTitle"),
    activeViewSubtitle: document.getElementById("activeViewSubtitle"),

    // Sidebar widgets & badges
    sidebarProgressBar: document.getElementById("sidebarProgressBar"),
    sidebarProgressPercent: document.getElementById("sidebarProgressPercent"),
    sidebarProgressSubtext: document.getElementById("sidebarProgressSubtext"),
    badgeAll: document.getElementById("badgeAll"),
    badgeToday: document.getElementById("badgeToday"),
    badgeImportant: document.getElementById("badgeImportant"),
    badgeInProgress: document.getElementById("badgeInProgress"),
    badgeCompleted: document.getElementById("badgeCompleted"),
    catBadgeWork: document.getElementById("catBadgeWork"),
    catBadgePersonal: document.getElementById("catBadgePersonal"),
    catBadgeStudy: document.getElementById("catBadgeStudy"),
    catBadgeHealth: document.getElementById("catBadgeHealth"),
    catBadgeFinance: document.getElementById("catBadgeFinance"),

    // Metric cards
    statTotal: document.getElementById("statTotal"),
    statActiveRatio: document.getElementById("statActiveRatio"),
    statInProgress: document.getElementById("statInProgress"),
    statInProgressDetail: document.getElementById("statInProgressDetail"),
    statCompleted: document.getElementById("statCompleted"),
    statCompletionRate: document.getElementById("statCompletionRate"),
    statUrgent: document.getElementById("statUrgent"),
    statUrgentDetail: document.getElementById("statUrgentDetail"),

    // Controls
    viewListBtn: document.getElementById("viewListBtn"),
    viewBoardBtn: document.getElementById("viewBoardBtn"),
    filterPrioritySelect: document.getElementById("filterPrioritySelect"),
    filterStatusSelect: document.getElementById("filterStatusSelect"),
    sortBySelect: document.getElementById("sortBySelect"),
    bulkCompleteBtn: document.getElementById("bulkCompleteBtn"),

    // Filter chips
    filterChipsBar: document.getElementById("filterChipsBar"),
    filterChipsList: document.getElementById("filterChipsList"),
    clearAllFiltersBtn: document.getElementById("clearAllFiltersBtn"),

    // Panels
    listViewContainer: document.getElementById("listViewContainer"),
    taskListElement: document.getElementById("taskListElement"),
    boardViewContainer: document.getElementById("boardViewContainer"),
    boardColumnTodo: document.getElementById("boardColumnTodo"),
    boardColumnInProgress: document.getElementById("boardColumnInProgress"),
    boardColumnCompleted: document.getElementById("boardColumnCompleted"),
    boardCountTodo: document.getElementById("boardCountTodo"),
    boardCountInProgress: document.getElementById("boardCountInProgress"),
    boardCountCompleted: document.getElementById("boardCountCompleted"),
    emptyState: document.getElementById("emptyState"),
    emptyStateDesc: document.getElementById("emptyStateDesc"),
    emptyCreateBtn: document.getElementById("emptyCreateBtn"),
    emptyResetFilterBtn: document.getElementById("emptyResetFilterBtn"),

    // Analytics
    categoryBarsList: document.getElementById("categoryBarsList"),
    priorityBreakdown: document.getElementById("priorityBreakdown"),

    // Storage action buttons
    resetDemoDataBtn: document.getElementById("resetDemoDataBtn"),
    exportDataBtn: document.getElementById("exportDataBtn"),
    clearAllTasksBtn: document.getElementById("clearAllTasksBtn"),

    // Task Modal
    taskModal: document.getElementById("taskModal"),
    modalTitle: document.getElementById("modalTitle"),
    closeModalBtn: document.getElementById("closeModalBtn"),
    cancelModalBtn: document.getElementById("cancelModalBtn"),
    taskForm: document.getElementById("taskForm"),
    taskId: document.getElementById("taskId"),
    taskTitle: document.getElementById("taskTitle"),
    taskDescription: document.getElementById("taskDescription"),
    taskCategory: document.getElementById("taskCategory"),
    taskPriority: document.getElementById("taskPriority"),
    taskDueDate: document.getElementById("taskDueDate"),
    taskStatus: document.getElementById("taskStatus"),

    // Delete Modal
    deleteConfirmModal: document.getElementById("deleteConfirmModal"),
    deleteTaskTitle: document.getElementById("deleteTaskTitle"),
    closeDeleteModalBtn: document.getElementById("closeDeleteModalBtn"),
    cancelDeleteBtn: document.getElementById("cancelDeleteBtn"),
    confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),

    // Toast
    toastContainer: document.getElementById("toastContainer")
  };

  // Format Helper: YYYY-MM-DD
  function getTodayString() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function getOffsetDateString(daysOffset) {
    const target = new Date();
    target.setDate(target.getDate() + daysOffset);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, "0");
    const dd = String(target.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  // Initial Demo Seed Tasks
  function getDemoTasks() {
    const today = getTodayString();
    return [
      {
        id: "task_1",
        title: "Finalize quarterly marketing pitch deck",
        description: "Review conversion analytics and sync with marketing leads on Q1 budget.",
        category: "Work",
        priority: "high",
        dueDate: today,
        status: "in-progress",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        completedAt: null
      },
      {
        id: "task_2",
        title: "Architect REST API authentication endpoints",
        description: "Implement OAuth2 flow and JWT token refresh middleware with rate limiting.",
        category: "Work",
        priority: "high",
        dueDate: getOffsetDateString(1),
        status: "todo",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        completedAt: null
      },
      {
        id: "task_3",
        title: "Prepare monthly personal financial budget",
        description: "Audit subscriptions, reconcile bank statements, and allocate savings investments.",
        category: "Finance",
        priority: "medium",
        dueDate: getOffsetDateString(3),
        status: "todo",
        createdAt: new Date().toISOString(),
        completedAt: null
      },
      {
        id: "task_4",
        title: "Complete 45-minute HIIT workout session",
        description: "Focus on cardio endurance and core strength routine.",
        category: "Health",
        priority: "low",
        dueDate: today,
        status: "completed",
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        completedAt: new Date().toISOString()
      },
      {
        id: "task_5",
        title: "Read Chapter 4 of System Design Handbook",
        description: "Take structured notes on database partitioning, replication lag, and sharding strategies.",
        category: "Study",
        priority: "medium",
        dueDate: getOffsetDateString(2),
        status: "in-progress",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        completedAt: null
      },
      {
        id: "task_6",
        title: "Schedule annual dental cleaning checkup",
        description: "Call clinic to confirm insurance coverage and book morning slot.",
        category: "Personal",
        priority: "low",
        dueDate: getOffsetDateString(5),
        status: "todo",
        createdAt: new Date().toISOString(),
        completedAt: null
      },
      {
        id: "task_7",
        title: "Code review pull request for billing webhook",
        description: "Check edge cases in Stripe signature verification and idempotent processing.",
        category: "Work",
        priority: "high",
        dueDate: getOffsetDateString(-1), // overdue to highlight urgency indicator
        status: "in-progress",
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        completedAt: null
      }
    ];
  }

  // --------------------------------------------------------------------------
  // Web Storage Operations
  // --------------------------------------------------------------------------
  function loadTasksFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to read from localStorage:", e);
    }
    // Default seed if empty or invalid
    const demo = getDemoTasks();
    saveTasksToStorage(demo);
    return demo;
  }

  function saveTasksToStorage(tasks) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error("Failed to write to localStorage:", e);
      showToast("Error saving to Web Storage. Local storage might be full.", "danger");
    }
  }

  // --------------------------------------------------------------------------
  // Toast Notifications
  // --------------------------------------------------------------------------
  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let iconSvg = "";
    if (type === "success") {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === "danger") {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "toastOut 0.25s ease-in forwards";
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 250);
    }, 3200);
  }

  // Utility to prevent XSS
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // --------------------------------------------------------------------------
  // Date Helpers
  // --------------------------------------------------------------------------
  function formatHumanDate(dateStr) {
    if (!dateStr) return "No date";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dateObj = new Date(year, month, day);

    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function getDueDateBadgeInfo(dueDateStr, isCompleted) {
    if (isCompleted) {
      return { className: "", label: "" };
    }
    const today = getTodayString();
    if (!dueDateStr) return { className: "", label: "" };

    if (dueDateStr < today) {
      return { className: "due-overdue", label: "Overdue" };
    } else if (dueDateStr === today) {
      return { className: "due-today", label: "Today" };
    }
    return { className: "", label: "" };
  }

  function updateCurrentDateHeader() {
    const now = new Date();
    const options = { weekday: "short", month: "short", day: "numeric", year: "numeric" };
    elements.currentDateDisplay.textContent = now.toLocaleDateString("en-US", options);
  }

  // --------------------------------------------------------------------------
  // Task Filtering and Sorting
  // --------------------------------------------------------------------------
  function getFilteredAndSortedTasks() {
    const today = getTodayString();

    const filtered = state.tasks.filter((task) => {
      // 1. Sidebar View Filter
      if (state.viewFilter === "today") {
        if (task.dueDate !== today) return false;
      } else if (state.viewFilter === "important") {
        if (task.priority !== "high") return false;
      } else if (state.viewFilter === "in-progress") {
        if (task.status !== "in-progress") return false;
      } else if (state.viewFilter === "completed") {
        if (task.status !== "completed") return false;
      }

      // 2. Category Filter
      if (state.categoryFilter !== "all") {
        if (task.category !== state.categoryFilter) return false;
      }

      // 3. Status Filter (from top controls dropdown)
      if (state.statusFilter !== "all") {
        if (task.status !== state.statusFilter) return false;
      }

      // 4. Priority Filter (from top controls dropdown)
      if (state.priorityFilter !== "all") {
        if (task.priority !== state.priorityFilter) return false;
      }

      // 5. Search Query
      if (state.searchQuery.trim() !== "") {
        const query = state.searchQuery.toLowerCase();
        const titleMatch = task.title.toLowerCase().includes(query);
        const descMatch = (task.description || "").toLowerCase().includes(query);
        const catMatch = (task.category || "").toLowerCase().includes(query);
        if (!titleMatch && !descMatch && !catMatch) return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (state.sortBy === "dueDateAsc") {
        return (a.dueDate || "9999-99-99").localeCompare(b.dueDate || "9999-99-99");
      } else if (state.sortBy === "dueDateDesc") {
        return (b.dueDate || "").localeCompare(a.dueDate || "");
      } else if (state.sortBy === "priority") {
        const pWeight = { high: 3, medium: 2, low: 1 };
        return (pWeight[b.priority] || 0) - (pWeight[a.priority] || 0);
      } else if (state.sortBy === "createdDesc") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (state.sortBy === "titleAsc") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return filtered;
  }

  // --------------------------------------------------------------------------
  // Update Metrics & Sidebar Counts
  // --------------------------------------------------------------------------
  function updateDashboardMetrics() {
    const today = getTodayString();
    const total = state.tasks.length;
    const completed = state.tasks.filter((t) => t.status === "completed").length;
    const inProgress = state.tasks.filter((t) => t.status === "in-progress").length;
    const urgent = state.tasks.filter(
      (t) => t.status !== "completed" && t.dueDate && t.dueDate <= today
    ).length;
    const dueTodayCount = state.tasks.filter((t) => t.dueDate === today).length;
    const highPrioCount = state.tasks.filter((t) => t.priority === "high").length;

    // Top Metric Cards
    elements.statTotal.textContent = total;
    elements.statActiveRatio.textContent = `${total - completed} active tasks remaining`;

    elements.statInProgress.textContent = inProgress;
    elements.statInProgressDetail.textContent =
      inProgress === 1 ? "1 task actively underway" : `${inProgress} tasks actively underway`;

    elements.statCompleted.textContent = completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    elements.statCompletionRate.textContent = `${rate}% completion rate`;

    elements.statUrgent.textContent = urgent;
    elements.statUrgentDetail.textContent =
      urgent > 0 ? `${urgent} overdue or due today` : "No overdue items";

    // Sidebar Progress Widget
    elements.sidebarProgressBar.style.width = `${rate}%`;
    elements.sidebarProgressPercent.textContent = `${rate}%`;
    elements.sidebarProgressSubtext.textContent = `${completed} of ${total} tasks completed`;

    // Sidebar View Badges
    elements.badgeAll.textContent = total;
    elements.badgeToday.textContent = dueTodayCount;
    elements.badgeImportant.textContent = highPrioCount;
    elements.badgeInProgress.textContent = inProgress;
    elements.badgeCompleted.textContent = completed;

    // Sidebar Category Badges
    const categories = ["Work", "Personal", "Study", "Health", "Finance"];
    categories.forEach((cat) => {
      const count = state.tasks.filter((t) => t.category === cat).length;
      const el = elements[`catBadge${cat}`];
      if (el) el.textContent = count;
    });

    // Update Analytics Section
    renderAnalytics(total);
  }

  function renderAnalytics(total) {
    // 1. Category Distribution Bars
    const categories = [
      { name: "Work", color: "#3b82f6" },
      { name: "Personal", color: "#ec4899" },
      { name: "Study", color: "#8b5cf6" },
      { name: "Health", color: "#10b981" },
      { name: "Finance", color: "#f59e0b" }
    ];

    let catHtml = "";
    categories.forEach((cat) => {
      const count = state.tasks.filter((t) => t.category === cat.name).length;
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      catHtml += `
        <div class="category-bar-item">
          <div class="bar-meta">
            <span>${cat.name}</span>
            <span>${count} tasks (${pct}%)</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${pct}%; background-color: ${cat.color};"></div>
          </div>
        </div>
      `;
    });
    elements.categoryBarsList.innerHTML = catHtml;

    // 2. Priority Distribution
    const prios = [
      { id: "high", name: "High", color: "#ef4444" },
      { id: "medium", name: "Medium", color: "#f59e0b" },
      { id: "low", name: "Low", color: "#10b981" }
    ];

    let prioHtml = "";
    prios.forEach((p) => {
      const count = state.tasks.filter((t) => t.priority === p.id).length;
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      prioHtml += `
        <div class="priority-row">
          <span class="prio-name" style="color: ${p.color};">${p.name}</span>
          <div class="prio-bar-wrap">
            <div class="prio-bar-fill" style="width: ${pct}%; background-color: ${p.color};"></div>
          </div>
          <span class="prio-count">${count}</span>
        </div>
      `;
    });
    elements.priorityBreakdown.innerHTML = prioHtml;
  }

  // --------------------------------------------------------------------------
  // Filter Chips UI
  // --------------------------------------------------------------------------
  function updateFilterChips() {
    const chips = [];

    if (state.viewFilter !== "all") {
      const viewNames = {
        today: "Due Today",
        important: "High Priority",
        "in-progress": "In Progress",
        completed: "Completed"
      };
      chips.push({ type: "view", label: `View: ${viewNames[state.viewFilter] || state.viewFilter}` });
    }

    if (state.categoryFilter !== "all") {
      chips.push({ type: "category", label: `Category: ${state.categoryFilter}` });
    }

    if (state.statusFilter !== "all") {
      const statusNames = { todo: "To Do", "in-progress": "In Progress", completed: "Completed" };
      chips.push({ type: "status", label: `Status: ${statusNames[state.statusFilter]}` });
    }

    if (state.priorityFilter !== "all") {
      chips.push({ type: "priority", label: `Priority: ${state.priorityFilter.toUpperCase()}` });
    }

    if (state.searchQuery.trim() !== "") {
      chips.push({ type: "search", label: `Search: "${state.searchQuery}"` });
    }

    if (chips.length > 0) {
      elements.filterChipsBar.style.display = "flex";
      elements.filterChipsList.innerHTML = chips
        .map(
          (c) => `
          <span class="filter-chip">
            <span>${escapeHtml(c.label)}</span>
            <button class="filter-chip-remove" data-chip-type="${c.type}">&times;</button>
          </span>
        `
        )
        .join("");
    } else {
      elements.filterChipsBar.style.display = "none";
      elements.filterChipsList.innerHTML = "";
    }
  }

  // --------------------------------------------------------------------------
  // Render Task List View
  // --------------------------------------------------------------------------
  function renderListView(tasks) {
    if (tasks.length === 0) {
      elements.listViewContainer.style.display = "none";
      return;
    }

    elements.listViewContainer.style.display = "block";
    let rowsHtml = "";

    tasks.forEach((task) => {
      const isCompleted = task.status === "completed";
      const dueInfo = getDueDateBadgeInfo(task.dueDate, isCompleted);
      const catClass = `badge-cat-${task.category.toLowerCase()}`;
      const prioClass = `badge-prio-${task.priority.toLowerCase()}`;
      const statusClass = `badge-status-${task.status.replace("-", "")}`;
      const statusLabels = { todo: "To Do", "in-progress": "In Progress", completed: "Completed" };

      rowsHtml += `
        <div class="task-row ${isCompleted ? "completed-row" : ""}" data-task-id="${task.id}">
          <!-- Title & Checkbox -->
          <div class="task-title-cell">
            <button class="custom-checkbox ${isCompleted ? "checked" : ""}" data-action="toggle-status" data-task-id="${task.id}" aria-label="Toggle task status">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
            <div class="task-meta-wrap">
              <div class="task-item-title">${escapeHtml(task.title)}</div>
              ${task.description ? `<div class="task-item-desc">${escapeHtml(task.description)}</div>` : ""}
            </div>
          </div>

          <!-- Category -->
          <div class="category-cell">
            <span class="badge ${catClass}">${escapeHtml(task.category)}</span>
          </div>

          <!-- Priority -->
          <div class="priority-cell">
            <span class="badge ${prioClass}">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              ${escapeHtml(task.priority.charAt(0).toUpperCase() + task.priority.slice(1))}
            </span>
          </div>

          <!-- Due Date -->
          <div class="due-date-cell">
            <span class="due-date-text ${dueInfo.className}">${formatHumanDate(task.dueDate)}</span>
            ${dueInfo.label ? `<span class="due-tag ${dueInfo.className}">${dueInfo.label}</span>` : ""}
          </div>

          <!-- Status -->
          <div class="status-col-cell">
            <span class="badge ${statusClass}">${statusLabels[task.status] || task.status}</span>
          </div>

          <!-- Actions -->
          <div class="actions-cell">
            <button class="action-icon-btn" data-action="edit" data-task-id="${task.id}" title="Edit Task">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="action-icon-btn action-icon-delete" data-action="delete" data-task-id="${task.id}" title="Delete Task">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
    });

    elements.taskListElement.innerHTML = rowsHtml;
  }

  // --------------------------------------------------------------------------
  // Render Board View (Kanban)
  // --------------------------------------------------------------------------
  function renderBoardView(tasks) {
    if (tasks.length === 0) {
      elements.boardViewContainer.style.display = "none";
      return;
    }

    elements.boardViewContainer.style.display = "block";

    const todoTasks = tasks.filter((t) => t.status === "todo");
    const inProgressTasks = tasks.filter((t) => t.status === "in-progress");
    const completedTasks = tasks.filter((t) => t.status === "completed");

    elements.boardCountTodo.textContent = todoTasks.length;
    elements.boardCountInProgress.textContent = inProgressTasks.length;
    elements.boardCountCompleted.textContent = completedTasks.length;

    elements.boardColumnTodo.innerHTML = renderKanbanCards(todoTasks);
    elements.boardColumnInProgress.innerHTML = renderKanbanCards(inProgressTasks);
    elements.boardColumnCompleted.innerHTML = renderKanbanCards(completedTasks);

    attachDragAndDropHandlers();
  }

  function renderKanbanCards(tasksList) {
    if (tasksList.length === 0) {
      return `<div style="text-align: center; color: #94a3b8; padding: 24px 0; font-size: 13px;">No tasks in this lane</div>`;
    }

    return tasksList
      .map((task) => {
        const catClass = `badge-cat-${task.category.toLowerCase()}`;
        const prioClass = `badge-prio-${task.priority.toLowerCase()}`;
        const isCompleted = task.status === "completed";
        const dueInfo = getDueDateBadgeInfo(task.dueDate, isCompleted);

        return `
        <div class="kanban-card" draggable="true" data-task-id="${task.id}">
          <div class="kanban-card-top">
            <span class="badge ${catClass}">${escapeHtml(task.category)}</span>
            <span class="badge ${prioClass}">
              ${escapeHtml(task.priority.charAt(0).toUpperCase() + task.priority.slice(1))}
            </span>
          </div>

          <h4 class="kanban-card-title">${escapeHtml(task.title)}</h4>
          ${task.description ? `<p class="kanban-card-desc">${escapeHtml(task.description)}</p>` : ""}

          <div class="kanban-card-footer">
            <div class="kanban-due-date ${dueInfo.className}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>${formatHumanDate(task.dueDate)}</span>
            </div>

            <div class="kanban-actions">
              <select class="kanban-move-select" data-task-id="${task.id}" title="Move status">
                <option value="todo" ${task.status === "todo" ? "selected" : ""}>To Do</option>
                <option value="in-progress" ${task.status === "in-progress" ? "selected" : ""}>In Progress</option>
                <option value="completed" ${task.status === "completed" ? "selected" : ""}>Done</option>
              </select>
              <button class="action-icon-btn" data-action="edit" data-task-id="${task.id}" title="Edit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
      })
      .join("");
  }

  // --------------------------------------------------------------------------
  // Kanban Drag and Drop Logic
  // --------------------------------------------------------------------------
  function attachDragAndDropHandlers() {
    const cards = document.querySelectorAll(".kanban-card");
    cards.forEach((card) => {
      card.addEventListener("dragstart", handleDragStart);
      card.addEventListener("dragend", handleDragEnd);
    });

    const dropzones = [
      elements.boardColumnTodo,
      elements.boardColumnInProgress,
      elements.boardColumnCompleted
    ];

    dropzones.forEach((zone) => {
      zone.addEventListener("dragover", handleDragOver);
      zone.addEventListener("dragleave", handleDragLeave);
      zone.addEventListener("drop", handleDrop);
    });
  }

  function handleDragStart(e) {
    state.draggedTaskId = this.getAttribute("data-task-id");
    this.classList.add("is-dragging");
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragEnd() {
    this.classList.remove("is-dragging");
    document.querySelectorAll(".board-column-dropzone").forEach((zone) => {
      zone.classList.remove("drag-over");
    });
    state.draggedTaskId = null;
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    this.classList.add("drag-over");
  }

  function handleDragLeave() {
    this.classList.remove("drag-over");
  }

  function handleDrop(e) {
    e.preventDefault();
    this.classList.remove("drag-over");
    const parentColumn = this.closest(".board-column");
    if (!parentColumn || !state.draggedTaskId) return;

    const newStatus = parentColumn.getAttribute("data-status");
    updateTaskStatus(state.draggedTaskId, newStatus);
  }

  // --------------------------------------------------------------------------
  // Main Render Controller
  // --------------------------------------------------------------------------
  function render() {
    const tasks = getFilteredAndSortedTasks();
    updateDashboardMetrics();
    updateFilterChips();

    // Check Empty State
    if (tasks.length === 0) {
      elements.listViewContainer.style.display = "none";
      elements.boardViewContainer.style.display = "none";
      elements.emptyState.style.display = "block";

      const hasActiveFilters =
        state.viewFilter !== "all" ||
        state.categoryFilter !== "all" ||
        state.statusFilter !== "all" ||
        state.priorityFilter !== "all" ||
        state.searchQuery.trim() !== "";

      elements.emptyResetFilterBtn.style.display = hasActiveFilters ? "inline-flex" : "none";
      elements.emptyStateDesc.textContent = hasActiveFilters
        ? "No tasks match your active filters or search terms. Try clearing them to see your tasks."
        : "You don't have any tasks right now. Create your first task to start organizing!";
    } else {
      elements.emptyState.style.display = "none";
      if (state.currentDisplay === "list") {
        elements.boardViewContainer.style.display = "none";
        renderListView(tasks);
      } else {
        elements.listViewContainer.style.display = "none";
        renderBoardView(tasks);
      }
    }
  }

  // --------------------------------------------------------------------------
  // Task CRUD Actions
  // --------------------------------------------------------------------------
  function createNewTask(taskData) {
    const newTask = {
      id: "task_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      title: taskData.title.trim(),
      description: taskData.description.trim(),
      category: taskData.category,
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      status: taskData.status || "todo",
      createdAt: new Date().toISOString(),
      completedAt: taskData.status === "completed" ? new Date().toISOString() : null
    };

    state.tasks.unshift(newTask);
    saveTasksToStorage(state.tasks);
    render();
    showToast("Task created successfully!", "success");
  }

  function updateExistingTask(id, taskData) {
    const index = state.tasks.findIndex((t) => t.id === id);
    if (index === -1) return;

    const current = state.tasks[index];
    const isNowCompleted = taskData.status === "completed";
    const wasCompleted = current.status === "completed";

    state.tasks[index] = {
      ...current,
      title: taskData.title.trim(),
      description: taskData.description.trim(),
      category: taskData.category,
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      status: taskData.status,
      completedAt: isNowCompleted ? current.completedAt || new Date().toISOString() : null
    };

    saveTasksToStorage(state.tasks);
    render();
    showToast("Task updated!", "success");
  }

  function updateTaskStatus(id, newStatus) {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;

    if (task.status === newStatus) return;

    task.status = newStatus;
    task.completedAt = newStatus === "completed" ? new Date().toISOString() : null;

    saveTasksToStorage(state.tasks);
    render();

    const statusNames = { todo: "To Do", "in-progress": "In Progress", completed: "Completed" };
    showToast(`Task moved to "${statusNames[newStatus]}"`, "info");
  }

  function toggleTaskStatus(id) {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;

    if (task.status === "completed") {
      task.status = "todo";
      task.completedAt = null;
      showToast("Task marked as To Do", "info");
    } else {
      task.status = "completed";
      task.completedAt = new Date().toISOString();
      showToast("Task marked as completed! 🎉", "success");
    }

    saveTasksToStorage(state.tasks);
    render();
  }

  function deleteTask(id) {
    state.tasks = state.tasks.filter((t) => t.id !== id);
    saveTasksToStorage(state.tasks);
    render();
    showToast("Task deleted", "danger");
  }

  function bulkCompleteFilteredTasks() {
    const filtered = getFilteredAndSortedTasks();
    const pendingTasks = filtered.filter((t) => t.status !== "completed");

    if (pendingTasks.length === 0) {
      showToast("All tasks in the current view are already completed.", "info");
      return;
    }

    pendingTasks.forEach((t) => {
      t.status = "completed";
      t.completedAt = new Date().toISOString();
    });

    saveTasksToStorage(state.tasks);
    render();
    showToast(`Marked ${pendingTasks.length} task(s) as completed!`, "success");
  }

  // --------------------------------------------------------------------------
  // Modal Management
  // --------------------------------------------------------------------------
  function openTaskModal(taskIdToEdit = null) {
    elements.taskForm.reset();

    if (taskIdToEdit) {
      const task = state.tasks.find((t) => t.id === taskIdToEdit);
      if (!task) return;
      elements.modalTitle.textContent = "Edit Task";
      elements.taskId.value = task.id;
      elements.taskTitle.value = task.title;
      elements.taskDescription.value = task.description || "";
      elements.taskCategory.value = task.category;
      elements.taskPriority.value = task.priority;
      elements.taskDueDate.value = task.dueDate || "";
      elements.taskStatus.value = task.status;
    } else {
      elements.modalTitle.textContent = "Create New Task";
      elements.taskId.value = "";
      elements.taskDueDate.value = getTodayString();
      elements.taskPriority.value = "medium";
      elements.taskStatus.value = "todo";
      elements.taskCategory.value = state.categoryFilter !== "all" ? state.categoryFilter : "Work";
    }

    elements.taskModal.classList.add("show");
    elements.taskModal.setAttribute("aria-hidden", "false");
    setTimeout(() => elements.taskTitle.focus(), 100);
  }

  function closeTaskModal() {
    elements.taskModal.classList.remove("show");
    elements.taskModal.setAttribute("aria-hidden", "true");
  }

  function openDeleteConfirmModal(taskId) {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return;
    state.taskPendingDeleteId = taskId;
    elements.deleteTaskTitle.textContent = `"${task.title}"`;
    elements.deleteConfirmModal.classList.add("show");
    elements.deleteConfirmModal.setAttribute("aria-hidden", "false");
  }

  function closeDeleteConfirmModal() {
    state.taskPendingDeleteId = null;
    elements.deleteConfirmModal.classList.remove("show");
    elements.deleteConfirmModal.setAttribute("aria-hidden", "true");
  }

  // --------------------------------------------------------------------------
  // LocalStorage Actions (Export, Reset, Clear)
  // --------------------------------------------------------------------------
  function resetDemoData() {
    if (confirm("Reset to default sample tasks? This will overwrite your current tasks.")) {
      const demo = getDemoTasks();
      state.tasks = demo;
      saveTasksToStorage(demo);
      render();
      showToast("Demo data loaded!", "info");
    }
  }

  function clearAllTasks() {
    if (confirm("Are you sure you want to delete ALL tasks? This cannot be undone.")) {
      state.tasks = [];
      saveTasksToStorage([]);
      render();
      showToast("All tasks cleared from storage.", "danger");
    }
  }

  function exportTasksAsJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.tasks, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `taskmaster_backup_${getTodayString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Tasks backup downloaded!", "success");
  }

  // --------------------------------------------------------------------------
  // Event Listeners & Binding
  // --------------------------------------------------------------------------
  function setupEventListeners() {
    // Mobile Sidebar Toggle
    elements.openSidebarBtn.addEventListener("click", () => {
      elements.sidebar.classList.add("open");
      elements.sidebarBackdrop.classList.add("show");
    });

    const closeSidebar = () => {
      elements.sidebar.classList.remove("open");
      elements.sidebarBackdrop.classList.remove("show");
    };

    elements.closeSidebarBtn.addEventListener("click", closeSidebar);
    elements.sidebarBackdrop.addEventListener("click", closeSidebar);

    // Sidebar View Navigation
    document.querySelectorAll("[data-filter-view]").forEach((btn) => {
      btn.addEventListener("click", function () {
        document.querySelectorAll("[data-filter-view]").forEach((b) => b.classList.remove("active"));
        this.classList.add("active");
        state.viewFilter = this.getAttribute("data-filter-view");

        // Update Page Title
        const titleMap = {
          all: "All Tasks",
          today: "Due Today",
          important: "High Priority Tasks",
          "in-progress": "Tasks In Progress",
          completed: "Completed Tasks"
        };
        elements.activeViewTitle.textContent = titleMap[state.viewFilter] || "Tasks";
        closeSidebar();
        render();
      });
    });

    // Sidebar Category Filter
    document.querySelectorAll("[data-filter-category]").forEach((btn) => {
      btn.addEventListener("click", function () {
        document.querySelectorAll("[data-filter-category]").forEach((b) => b.classList.remove("active-category"));
        this.classList.add("active-category");
        state.categoryFilter = this.getAttribute("data-filter-category");
        closeSidebar();
        render();
      });
    });

    // Search Input
    elements.searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      elements.searchClearBtn.style.display = state.searchQuery ? "block" : "none";
      render();
    });

    elements.searchClearBtn.addEventListener("click", () => {
      elements.searchInput.value = "";
      state.searchQuery = "";
      elements.searchClearBtn.style.display = "none";
      render();
      elements.searchInput.focus();
    });

    // View Switcher (List vs Board)
    elements.viewListBtn.addEventListener("click", () => {
      elements.viewListBtn.classList.add("active");
      elements.viewBoardBtn.classList.remove("active");
      state.currentDisplay = "list";
      render();
    });

    elements.viewBoardBtn.addEventListener("click", () => {
      elements.viewBoardBtn.classList.add("active");
      elements.viewListBtn.classList.remove("active");
      state.currentDisplay = "board";
      render();
    });

    // Dropdown Filters
    elements.filterPrioritySelect.addEventListener("change", (e) => {
      state.priorityFilter = e.target.value;
      render();
    });

    elements.filterStatusSelect.addEventListener("change", (e) => {
      state.statusFilter = e.target.value;
      render();
    });

    elements.sortBySelect.addEventListener("change", (e) => {
      state.sortBy = e.target.value;
      render();
    });

    // Bulk Complete Button
    elements.bulkCompleteBtn.addEventListener("click", bulkCompleteFilteredTasks);

    // Filter Chips Reset
    elements.clearAllFiltersBtn.addEventListener("click", resetAllFilters);
    elements.emptyResetFilterBtn.addEventListener("click", resetAllFilters);

    elements.filterChipsList.addEventListener("click", (e) => {
      const removeBtn = e.target.closest(".filter-chip-remove");
      if (!removeBtn) return;
      const type = removeBtn.getAttribute("data-chip-type");

      if (type === "view") {
        state.viewFilter = "all";
        document.querySelectorAll("[data-filter-view]").forEach((b) => {
          b.classList.toggle("active", b.getAttribute("data-filter-view") === "all");
        });
        elements.activeViewTitle.textContent = "All Tasks";
      } else if (type === "category") {
        state.categoryFilter = "all";
        document.querySelectorAll("[data-filter-category]").forEach((b) => {
          b.classList.toggle("active-category", b.getAttribute("data-filter-category") === "all");
        });
      } else if (type === "status") {
        state.statusFilter = "all";
        elements.filterStatusSelect.value = "all";
      } else if (type === "priority") {
        state.priorityFilter = "all";
        elements.filterPrioritySelect.value = "all";
      } else if (type === "search") {
        state.searchQuery = "";
        elements.searchInput.value = "";
        elements.searchClearBtn.style.display = "none";
      }
      render();
    });

    // Storage Actions
    elements.resetDemoDataBtn.addEventListener("click", resetDemoData);
    elements.exportDataBtn.addEventListener("click", exportTasksAsJSON);
    elements.clearAllTasksBtn.addEventListener("click", clearAllTasks);

    // Open Modal Buttons
    elements.openNewTaskModalBtn.addEventListener("click", () => openTaskModal());
    elements.emptyCreateBtn.addEventListener("click", () => openTaskModal());

    // Task Form Submit
    elements.taskForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const taskData = {
        title: elements.taskTitle.value,
        description: elements.taskDescription.value,
        category: elements.taskCategory.value,
        priority: elements.taskPriority.value,
        dueDate: elements.taskDueDate.value,
        status: elements.taskStatus.value
      };

      const existingId = elements.taskId.value;
      if (existingId) {
        updateExistingTask(existingId, taskData);
      } else {
        createNewTask(taskData);
      }
      closeTaskModal();
    });

    // Close Modal Events
    elements.closeModalBtn.addEventListener("click", closeTaskModal);
    elements.cancelModalBtn.addEventListener("click", closeTaskModal);
    elements.taskModal.addEventListener("click", (e) => {
      if (e.target === elements.taskModal) closeTaskModal();
    });

    // Delete Modal Events
    elements.closeDeleteModalBtn.addEventListener("click", closeDeleteConfirmModal);
    elements.cancelDeleteBtn.addEventListener("click", closeDeleteConfirmModal);
    elements.deleteConfirmModal.addEventListener("click", (e) => {
      if (e.target === elements.deleteConfirmModal) closeDeleteConfirmModal();
    });

    elements.confirmDeleteBtn.addEventListener("click", () => {
      if (state.taskPendingDeleteId) {
        deleteTask(state.taskPendingDeleteId);
        closeDeleteConfirmModal();
      }
    });

    // Global Task Action Delegation (List & Board clicks)
    document.addEventListener("click", (e) => {
      const toggleBtn = e.target.closest('[data-action="toggle-status"]');
      if (toggleBtn) {
        const taskId = toggleBtn.getAttribute("data-task-id");
        toggleTaskStatus(taskId);
        return;
      }

      const editBtn = e.target.closest('[data-action="edit"]');
      if (editBtn) {
        const taskId = editBtn.getAttribute("data-task-id");
        openTaskModal(taskId);
        return;
      }

      const deleteBtn = e.target.closest('[data-action="delete"]');
      if (deleteBtn) {
        const taskId = deleteBtn.getAttribute("data-task-id");
        openDeleteConfirmModal(taskId);
        return;
      }
    });

    // Kanban Move Select Change Delegation
    document.addEventListener("change", (e) => {
      if (e.target.classList.contains("kanban-move-select")) {
        const taskId = e.target.getAttribute("data-task-id");
        const newStatus = e.target.value;
        updateTaskStatus(taskId, newStatus);
      }
    });

    // Escape Key Handler for Modals
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (elements.taskModal.classList.contains("show")) closeTaskModal();
        if (elements.deleteConfirmModal.classList.contains("show")) closeDeleteConfirmModal();
      }
    });
  }

  function resetAllFilters() {
    state.viewFilter = "all";
    state.categoryFilter = "all";
    state.statusFilter = "all";
    state.priorityFilter = "all";
    state.searchQuery = "";

    elements.filterPrioritySelect.value = "all";
    elements.filterStatusSelect.value = "all";
    elements.searchInput.value = "";
    elements.searchClearBtn.style.display = "none";

    document.querySelectorAll("[data-filter-view]").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-filter-view") === "all");
    });
    document.querySelectorAll("[data-filter-category]").forEach((b) => {
      b.classList.toggle("active-category", b.getAttribute("data-filter-category") === "all");
    });

    elements.activeViewTitle.textContent = "All Tasks";
    render();
  }

  // --------------------------------------------------------------------------
  // Application Bootstrap
  // --------------------------------------------------------------------------
  function init() {
    updateCurrentDateHeader();
    state.tasks = loadTasksFromStorage();
    setupEventListeners();
    render();
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
