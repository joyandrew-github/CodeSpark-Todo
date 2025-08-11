// Quest Master Dashboard JavaScript
class QuestMaster {
    constructor() {
        this.currentUser = {
            name: 'Quest Master',
            level: 1,
            coins: 50,
            streak: 0,
            totalTasks: 0,
            completedTasks: 0,
            email: '',
            joinDate: new Date()
        };
        
        this.tasks = [];
        this.achievements = [
            { id: 'first_quest', name: 'First Quest', description: 'Complete your first task', unlocked: false, coins: 25 },
            { id: 'streak_master', name: 'Streak Master', description: 'Maintain a 7-day streak', unlocked: false, coins: 100 },
            { id: 'quiz_champion', name: 'Quiz Champion', description: 'Get 10 quiz questions right', unlocked: false, coins: 50 },
            { id: 'task_master', name: 'Task Master', description: 'Complete 25 tasks', unlocked: false, coins: 75 },
            { id: 'early_bird', name: 'Early Bird', description: 'Complete 5 tasks before noon', unlocked: false, coins: 40 }
        ];
        
        this.quizQuestions = [
            {
                question: "What is the capital of France?",
                options: ["London", "Berlin", "Paris", "Madrid"],
                correct: 2
            },
            {
                question: "Which planet is known as the Red Planet?",
                options: ["Venus", "Mars", "Jupiter", "Saturn"],
                correct: 1
            },
            {
                question: "What is 15 × 8?",
                options: ["120", "115", "125", "130"],
                correct: 0
            },
            {
                question: "Who wrote 'Romeo and Juliet'?",
                options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
                correct: 1
            },
            {
                question: "What is the largest ocean on Earth?",
                options: ["Atlantic", "Indian", "Arctic", "Pacific"],
                correct: 3
            },
            {
                question: "In which year did World War II end?",
                options: ["1944", "1945", "1946", "1947"],
                correct: 1
            },
            {
                question: "What is the chemical symbol for gold?",
                options: ["Go", "Gd", "Au", "Ag"],
                correct: 2
            },
            {
                question: "Which is the smallest country in the world?",
                options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
                correct: 1
            },
            {
                question: "What is the square root of 144?",
                options: ["11", "12", "13", "14"],
                correct: 1
            },
            {
                question: "Who painted the Mona Lisa?",
                options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
                correct: 2
            }
        ];
        
        this.currentQuiz = null;
        this.currentQuizIndex = 0;
        this.quizAnswers = [];
        this.quizTimer = null;
        this.quizTimeLeft = 30;
        
        this.notifications = [];
        this.currentFilter = 'all';
        this.currentView = 'grid';
        this.currentSection = 'dashboard';
        
        this.settings = {
            emailNotifications: true,
            pushNotifications: true,
            soundEffects: true,
            theme: 'dark',
            accentColor: '#6366f1'
        };
        
        this.init();
    }
    
    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateUI();
        this.startPeriodicUpdates();
        this.showLoadingScreen();
        
        // Hide loading screen after initialization
        setTimeout(() => {
            this.hideLoadingScreen();
        }, 1500);
    }
    
    // Data Management
    loadData() {
        try {
            const savedUser = JSON.parse(localStorage.getItem('questmaster_user') || '{}');
            const savedTasks = JSON.parse(localStorage.getItem('questmaster_tasks') || '[]');
            const savedAchievements = JSON.parse(localStorage.getItem('questmaster_achievements') || '[]');
            const savedSettings = JSON.parse(localStorage.getItem('questmaster_settings') || '{}');
            
            this.currentUser = { ...this.currentUser, ...savedUser };
            this.tasks = savedTasks;
            this.settings = { ...this.settings, ...savedSettings };
            
            // Merge saved achievements with default ones
            if (savedAchievements.length > 0) {
                this.achievements = this.achievements.map(achievement => {
                    const saved = savedAchievements.find(a => a.id === achievement.id);
                    return saved ? { ...achievement, ...saved } : achievement;
                });
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }
    
    saveData() {
        try {
            localStorage.setItem('questmaster_user', JSON.stringify(this.currentUser));
            localStorage.setItem('questmaster_tasks', JSON.stringify(this.tasks));
            localStorage.setItem('questmaster_achievements', JSON.stringify(this.achievements));
            localStorage.setItem('questmaster_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving data:', error);
            this.showNotification('Failed to save data', 'error');
        }
    }
    
    // Event Listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.switchSection(section);
            });
        });
        
        // Mobile menu
        document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });
        
        document.getElementById('sidebarToggle')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('collapsed');
        });
        
        // Task form
        document.getElementById('taskForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });
        
        // Quick actions
        document.getElementById('quickAddTask')?.addEventListener('click', () => {
            this.switchSection('tasks');
            document.getElementById('taskName')?.focus();
        });
        
        document.getElementById('viewUrgent')?.addEventListener('click', () => {
            this.switchSection('tasks');
            this.setFilter('urgent');
        });
        
        document.getElementById('viewProgress')?.addEventListener('click', () => {
            this.switchSection('progress');
        });
        
        document.getElementById('takeQuiz')?.addEventListener('click', () => {
            this.openQuizModal();
        });
        
        // Task filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setFilter(btn.dataset.filter);
            });
        });
        
        // View options
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setView(btn.dataset.view);
            });
        });
        
        // Quiz modal
        document.getElementById('startQuiz')?.addEventListener('click', () => {
            this.startQuiz();
        });
        
        document.getElementById('nextQuestion')?.addEventListener('click', () => {
            this.nextQuestion();
        });
        
        document.getElementById('prevQuestion')?.addEventListener('click', () => {
            this.prevQuestion();
        });
        
        document.getElementById('submitQuiz')?.addEventListener('click', () => {
            this.submitQuiz();
        });
        
        document.getElementById('closeQuizModal')?.addEventListener('click', () => {
            this.closeQuizModal();
        });
        
        document.getElementById('closeQuiz')?.addEventListener('click', () => {
            this.closeQuizModal();
        });
        
        // Profile form
        document.getElementById('profileForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateProfile();
        });
        
        // Settings
        document.getElementById('exportData')?.addEventListener('click', () => {
            this.exportData();
        });
        
        document.getElementById('importData')?.addEventListener('click', () => {
            document.getElementById('importFile')?.click();
        });
        
        document.getElementById('importFile')?.addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });
        
        document.getElementById('clearAllData')?.addEventListener('click', () => {
            this.clearAllData();
        });
        
        // Settings toggles
        document.querySelectorAll('.setting-label input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateSettings();
            });
        });
        
        document.getElementById('themeSelect')?.addEventListener('change', () => {
            this.updateSettings();
        });
        
        document.getElementById('accentColor')?.addEventListener('change', () => {
            this.updateSettings();
        });
        
        // Modal close handlers
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });
        
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal').classList.remove('show');
            });
        });
        
        // Search functionality
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.searchTasks(e.target.value);
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }
    
    // UI Updates
    updateUI() {
        this.updateUserStats();
        this.updateDashboardStats();
        this.updateTasksDisplay();
        this.updateProgressDisplay();
        this.updateWalletDisplay();
        this.updateLeaderboardDisplay();
        this.updateProfileDisplay();
        this.updateSettingsDisplay();
        this.updateAchievementsDisplay();
    }
    
    updateUserStats() {
        // Sidebar stats
        document.getElementById('sidebarLevel').textContent = this.currentUser.level;
        document.getElementById('sidebarCoins').textContent = this.currentUser.coins;
        document.getElementById('sidebarStreak').textContent = this.currentUser.streak;
        
        // Header stats
        document.getElementById('headerLevel').textContent = this.currentUser.level;
        document.getElementById('headerCoins').textContent = this.currentUser.coins;
        document.getElementById('headerStreak').textContent = this.currentUser.streak;
        
        // User name
        document.getElementById('userName').textContent = this.currentUser.name;
    }
    
    updateDashboardStats() {
        const urgentTasks = this.getUrgentTasks().length;
        const overdueTasks = this.getOverdueTasks().length;
        const todayCompleted = this.getTodayCompletedTasks().length;
        
        document.getElementById('totalTasks').textContent = this.tasks.length;
        document.getElementById('completedTasks').textContent = todayCompleted;
        document.getElementById('urgentTasks').textContent = urgentTasks;
        document.getElementById('overdueTasks').textContent = overdueTasks;
        
        // Update progress ring
        this.updateProgressRing();
    }
    
    updateProgressRing() {
        const todayTasks = this.getTodayTasks();
        const completedToday = todayTasks.filter(task => task.completed).length;
        const total = todayTasks.length;
        const percentage = total > 0 ? (completedToday / total) * 100 : 0;
        
        const circle = document.querySelector('.progress-ring-circle');
        const circumference = 2 * Math.PI * 50; // radius is 50
        const offset = circumference - (percentage / 100) * circumference;
        
        if (circle) {
            circle.style.strokeDashoffset = offset;
        }
        
        document.getElementById('progressPercent').textContent = `${Math.round(percentage)}%`;
        document.getElementById('progressStats').textContent = `${completedToday} of ${total} completed`;
    }
    
    updateTasksDisplay() {
        const container = document.getElementById('tasksContainer');
        const emptyState = document.getElementById('emptyState');
        
        if (!container) return;
        
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            container.style.display = 'grid';
            emptyState.style.display = 'none';
            container.innerHTML = filteredTasks.map(task => this.createTaskCard(task)).join('');
            
            // Add event listeners to task cards
            this.addTaskCardListeners();
        }
    }
    
    createTaskCard(task) {
        const dueDate = new Date(task.deadline);
        const now = new Date();
        const isOverdue = dueDate < now && !task.completed;
        const isUrgent = (dueDate - now) / (1000 * 60 * 60) < 24 && !task.completed; // Less than 24 hours
        
        return `
            <div class="task-card priority-${task.priority} ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-header">
                    <div>
                        <div class="task-category">${this.getCategoryEmoji(task.category)} ${task.category}</div>
                        <h3 class="task-title">${task.name}</h3>
                    </div>
                </div>
                
                ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
                
                <div class="task-meta">
                    <div class="task-deadline ${isOverdue ? 'overdue' : isUrgent ? 'urgent' : ''}">
                        <i class="fas fa-calendar"></i>
                        <span>${this.formatDate(dueDate)}</span>
                    </div>
                    <div class="task-priority ${task.priority}">
                        <i class="fas fa-flag"></i>
                        <span>${task.priority.toUpperCase()}</span>
                    </div>
                </div>
                
                <div class="task-actions">
                    <button class="task-action-btn ${task.completed ? 'complete' : ''}" 
                            onclick="questMaster.toggleTaskComplete('${task.id}')" 
                            title="${task.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                        <i class="fas fa-${task.completed ? 'undo' : 'check'}"></i>
                    </button>
                    <button class="task-action-btn" 
                            onclick="questMaster.editTask('${task.id}')" 
                            title="Edit task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-action-btn" 
                            onclick="questMaster.deleteTask('${task.id}')" 
                            title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="task-action-btn" 
                            onclick="questMaster.viewTaskDetails('${task.id}')" 
                            title="View details">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    addTaskCardListeners() {
        document.querySelectorAll('.task-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.task-actions')) {
                    const taskId = card.dataset.taskId;
                    this.viewTaskDetails(taskId);
                }
            });
        });
    }
    
    updateProgressDisplay() {
        // This would typically include chart updates
        // For now, we'll just show a placeholder
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer && !chartContainer.querySelector('canvas')) {
            chartContainer.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-muted);">
                    <div style="text-align: center;">
                        <i class="fas fa-chart-bar" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                        <p>Progress charts coming soon!</p>
                    </div>
                </div>
            `;
        }
    }
    
    updateWalletDisplay() {
        document.getElementById('walletBalance').textContent = this.currentUser.coins;
        
        // Calculate stats (simplified for demo)
        const todayEarned = 20; // This would be calculated from actual transactions
        const weekEarned = 150;
        const totalEarned = this.currentUser.coins;
        
        document.getElementById('coinsEarnedToday').textContent = todayEarned;
        document.getElementById('coinsEarnedWeek').textContent = weekEarned;
        document.getElementById('totalCoinsEarned').textContent = totalEarned;
    }
    
    updateLeaderboardDisplay() {
        document.getElementById('leaderboardScore').textContent = this.calculateUserScore();
    }
    
    updateProfileDisplay() {
        document.getElementById('profileName').textContent = this.currentUser.name;
        document.getElementById('profileLevel').textContent = this.currentUser.level;
        document.getElementById('profileTotalTasks').textContent = this.tasks.length;
        document.getElementById('profileCompletedTasks').textContent = this.tasks.filter(t => t.completed).length;
        document.getElementById('profileStreak').textContent = this.currentUser.streak;
        
        document.getElementById('profileNameInput').value = this.currentUser.name;
        document.getElementById('profileEmail').value = this.currentUser.email || '';
    }
    
    updateSettingsDisplay() {
        document.getElementById('emailNotifications').checked = this.settings.emailNotifications;
        document.getElementById('pushNotifications').checked = this.settings.pushNotifications;
        document.getElementById('soundEffects').checked = this.settings.soundEffects;
        document.getElementById('themeSelect').value = this.settings.theme;
        document.getElementById('accentColor').value = this.settings.accentColor;
    }
    
    updateAchievementsDisplay() {
        const container = document.getElementById('achievementsList');
        if (!container) return;
        
        container.innerHTML = this.achievements.map(achievement => `
            <div class="achievement ${achievement.unlocked ? 'unlocked' : 'locked'}">
                <i class="fas fa-${this.getAchievementIcon(achievement.id)}"></i>
                <div>
                    <h4>${achievement.name}</h4>
                    <p>${achievement.description}</p>
                </div>
            </div>
        `).join('');
    }
    
    // Task Management
    addTask() {
        const form = document.getElementById('taskForm');
        const formData = new FormData(form);
        
        const task = {
            id: this.generateId(),
            name: document.getElementById('taskName').value,
            category: document.getElementById('taskCategory').value,
            deadline: document.getElementById('taskDeadline').value,
            priority: document.getElementById('taskPriority').value,
            description: document.getElementById('taskDescription').value,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };
        
        this.tasks.push(task);
        this.saveData();
        this.updateUI();
        
        // Reset form
        form.reset();
        
        // Show success notification
        this.showNotification('Quest created successfully!', 'success');
        
        // Play sound effect
        this.playSound('task_created');
        
        // Add recent activity
        this.addRecentActivity('Created new quest: ' + task.name, 'plus', 'success');
        
        // Check for achievements
        this.checkAchievements();
    }
    
    toggleTaskComplete(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;
        
        if (task.completed) {
            // Award coins
            const coins = this.calculateTaskCoins(task);
            this.awardCoins(coins);
            
            // Update user stats
            this.currentUser.completedTasks++;
            this.updateStreak();
            this.checkLevelUp();
            
            // Show completion animation
            this.showCoinAnimation(coins);
            this.playSound('task_complete');
            
            // Add recent activity
            this.addRecentActivity('Completed quest: ' + task.name, 'check', 'success');
            
            // Show notification
            this.showNotification(`Quest completed! +${coins} coins`, 'success');
        } else {
            this.addRecentActivity('Uncompleted quest: ' + task.name, 'undo', 'info');
        }
        
        this.saveData();
        this.updateUI();
        this.checkAchievements();
    }
    
    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // Populate form with task data
        document.getElementById('taskName').value = task.name;
        document.getElementById('taskCategory').value = task.category;
        document.getElementById('taskDeadline').value = task.deadline;
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskDescription').value = task.description;
        
        // Remove the task temporarily (we'll add it back when form is submitted)
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        
        // Scroll to form
        document.getElementById('taskForm').scrollIntoView({ behavior: 'smooth' });
        document.getElementById('taskName').focus();
        
        this.showNotification('Task loaded for editing', 'info');
    }
    
    deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this quest?')) return;
        
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveData();
        this.updateUI();
        
        this.addRecentActivity('Deleted quest: ' + task.name, 'trash', 'danger');
        this.showNotification('Quest deleted', 'error');
    }
    
    viewTaskDetails(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const modal = document.getElementById('taskModal');
        const title = document.getElementById('taskModalTitle');
        const body = document.getElementById('taskModalBody');
        
        title.textContent = task.name;
        body.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <strong>Category:</strong> ${this.getCategoryEmoji(task.category)} ${task.category}
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Priority:</strong> <span class="task-priority ${task.priority}">${task.priority.toUpperCase()}</span>
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Deadline:</strong> ${this.formatDate(new Date(task.deadline))}
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Status:</strong> ${task.completed ? '✅ Completed' : '⏳ Pending'}
            </div>
            ${task.description ? `<div style="margin-bottom: 1rem;"><strong>Description:</strong><br>${task.description}</div>` : ''}
            <div style="margin-bottom: 1rem;">
                <strong>Created:</strong> ${this.formatDate(new Date(task.createdAt))}
            </div>
            ${task.completedAt ? `<div><strong>Completed:</strong> ${this.formatDate(new Date(task.completedAt))}</div>` : ''}
        `;
        
        modal.classList.add('show');
    }
    
    // Quiz System
    openQuizModal() {
        const modal = document.getElementById('quizModal');
        modal.classList.add('show');
        this.resetQuiz();
    }
    
    closeQuizModal() {
        const modal = document.getElementById('quizModal');
        modal.classList.remove('show');
        this.resetQuiz();
    }
    
    resetQuiz() {
        this.currentQuiz = null;
        this.currentQuizIndex = 0;
        this.quizAnswers = [];
        this.quizTimeLeft = 30;
        
        if (this.quizTimer) {
            clearInterval(this.quizTimer);
            this.quizTimer = null;
        }
        
        // Reset UI
        document.getElementById('quizContent').style.display = 'block';
        document.getElementById('quizResults').style.display = 'none';
        document.getElementById('startQuiz').style.display = 'inline-flex';
        document.getElementById('closeQuiz').style.display = 'none';
    }
    
    startQuiz() {
        // Shuffle questions
        this.currentQuiz = [...this.quizQuestions].sort(() => Math.random() - 0.5).slice(0, 10);
        this.currentQuizIndex = 0;
        this.quizAnswers = new Array(this.currentQuiz.length).fill(-1);
        
        document.getElementById('startQuiz').style.display = 'none';
        this.displayQuestion();
        this.startTimer();
    }
    
    displayQuestion() {
        const question = this.currentQuiz[this.currentQuizIndex];
        const questionElement = document.getElementById('questionText');
        const optionsElement = document.getElementById('answerOptions');
        
        questionElement.textContent = question.question;
        optionsElement.innerHTML = question.options.map((option, index) => `
            <div class="answer-option ${this.quizAnswers[this.currentQuizIndex] === index ? 'selected' : ''}"
                 onclick="questMaster.selectAnswer(${index})">
                ${option}
            </div>
        `).join('');
        
        // Update navigation
        document.getElementById('currentQuestion').textContent = this.currentQuizIndex + 1;
        document.getElementById('totalQuestions').textContent = this.currentQuiz.length;
        
        document.getElementById('prevQuestion').disabled = this.currentQuizIndex === 0;
        
        if (this.currentQuizIndex === this.currentQuiz.length - 1) {
            document.getElementById('nextQuestion').style.display = 'none';
            document.getElementById('submitQuiz').style.display = 'inline-flex';
        } else {
            document.getElementById('nextQuestion').style.display = 'inline-flex';
            document.getElementById('submitQuiz').style.display = 'none';
        }
    }
    
    selectAnswer(answerIndex) {
        this.quizAnswers[this.currentQuizIndex] = answerIndex;
        
        // Update UI
        document.querySelectorAll('.answer-option').forEach((option, index) => {
            option.classList.toggle('selected', index === answerIndex);
        });
    }
    
    nextQuestion() {
        if (this.currentQuizIndex < this.currentQuiz.length - 1) {
            this.currentQuizIndex++;
            this.displayQuestion();
        }
    }
    
    prevQuestion() {
        if (this.currentQuizIndex > 0) {
            this.currentQuizIndex--;
            this.displayQuestion();
        }
    }
    
    startTimer() {
        this.quizTimeLeft = 30;
        this.updateTimer();
        
        this.quizTimer = setInterval(() => {
            this.quizTimeLeft--;
            this.updateTimer();
            
            if (this.quizTimeLeft <= 0) {
                this.nextQuestion();
                if (this.currentQuizIndex >= this.currentQuiz.length) {
                    this.submitQuiz();
                } else {
                    this.quizTimeLeft = 30;
                }
            }
        }, 1000);
    }
    
    updateTimer() {
        document.getElementById('quizTimer').textContent = `${this.quizTimeLeft}s`;
    }
    
    submitQuiz() {
        if (this.quizTimer) {
            clearInterval(this.quizTimer);
            this.quizTimer = null;
        }
        
        // Calculate score
        let correctAnswers = 0;
        this.currentQuiz.forEach((question, index) => {
            if (this.quizAnswers[index] === question.correct) {
                correctAnswers++;
            }
        });
        
        const coinsEarned = correctAnswers * 10;
        this.awardCoins(coinsEarned);
        
        // Show results
        document.getElementById('quizContent').style.display = 'none';
        document.getElementById('quizResults').style.display = 'block';
        document.getElementById('closeQuiz').style.display = 'inline-flex';
        
        document.getElementById('correctAnswers').textContent = correctAnswers;
        document.getElementById('totalAnswers').textContent = this.currentQuiz.length;
        document.getElementById('coinsEarned').textContent = `+${coinsEarned}`;
        
        // Result message
        let message = '';
        const percentage = (correctAnswers / this.currentQuiz.length) * 100;
        if (percentage >= 90) message = 'Outstanding performance!';
        else if (percentage >= 80) message = 'Excellent work!';
        else if (percentage >= 70) message = 'Good job!';
        else if (percentage >= 60) message = 'Not bad!';
        else message = 'Keep practicing!';
        
        document.getElementById('resultMessage').textContent = message;
        
        // Save data and update UI
        this.saveData();
        this.updateUI();
        this.checkAchievements();
        
        // Add to recent activity
        this.addRecentActivity(`Completed quiz: ${correctAnswers}/${this.currentQuiz.length} correct`, 'brain', 'success');
    }
    
    // Gamification System
    awardCoins(amount) {
        this.currentUser.coins += amount;
        this.playSound('coin_earned');
    }
    
    checkLevelUp() {
        const newLevel = Math.floor(this.currentUser.completedTasks / 5) + 1;
        if (newLevel > this.currentUser.level) {
            const oldLevel = this.currentUser.level;
            this.currentUser.level = newLevel;
            this.showLevelUpAnimation(newLevel);
            this.addRecentActivity(`Level up! Now level ${newLevel}`, 'star', 'success');
            this.playSound('level_up');
        }
    }
    
    updateStreak() {
        const today = new Date().toDateString();
        const lastActivity = localStorage.getItem('last_activity_date');
        
        if (lastActivity !== today) {
            if (lastActivity === new Date(Date.now() - 86400000).toDateString()) {
                // Yesterday - continue streak
                this.currentUser.streak++;
            } else {
                // Missed a day - reset streak
                this.currentUser.streak = 1;
            }
            localStorage.setItem('last_activity_date', today);
        }
    }
    
    calculateTaskCoins(task) {
        let baseCoins = 10;
        
        // Priority bonus
        if (task.priority === 'high') baseCoins += 5;
        else if (task.priority === 'medium') baseCoins += 3;
        
        // Urgency bonus
        const deadline = new Date(task.deadline);
        const now = new Date();
        const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);
        
        if (hoursUntilDeadline < 24) baseCoins += 5; // Urgent task bonus
        
        return baseCoins;
    }
    
    calculateUserScore() {
        return this.currentUser.completedTasks * 10 + this.currentUser.coins + this.currentUser.streak * 5;
    }
    
    checkAchievements() {
        this.achievements.forEach(achievement => {
            if (!achievement.unlocked && this.isAchievementUnlocked(achievement)) {
                achievement.unlocked = true;
                this.awardCoins(achievement.coins);
                this.showAchievementNotification(achievement);
                this.playSound('achievement');
            }
        });
    }
    
    isAchievementUnlocked(achievement) {
        switch (achievement.id) {
            case 'first_quest':
                return this.tasks.some(task => task.completed);
            case 'streak_master':
                return this.currentUser.streak >= 7;
            case 'quiz_champion':
                // This would need to track quiz performance over time
                return false; // Simplified for demo
            case 'task_master':
                return this.tasks.filter(task => task.completed).length >= 25;
            case 'early_bird':
                // This would need to track completion times
                return false; // Simplified for demo
            default:
                return false;
        }
    }
    
    // Filtering and Search
    getFilteredTasks() {
        let filtered = [...this.tasks];
        
        switch (this.currentFilter) {
            case 'urgent':
                filtered = this.getUrgentTasks();
                break;
            case 'today':
                filtered = this.getTodayTasks();
                break;
            case 'completed':
                filtered = filtered.filter(task => task.completed);
                break;
            case 'overdue':
                filtered = this.getOverdueTasks();
                break;
            default:
                // 'all' - no additional filtering
                break;
        }
        
        return filtered.sort((a, b) => {
            // Sort by priority, then by deadline
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const aPriority = priorityOrder[a.priority];
            const bPriority = priorityOrder[b.priority];
            
            if (aPriority !== bPriority) {
                return bPriority - aPriority;
            }
            
            return new Date(a.deadline) - new Date(b.deadline);
        });
    }
    
    getUrgentTasks() {
        const now = new Date();
        return this.tasks.filter(task => {
            if (task.completed) return false;
            const deadline = new Date(task.deadline);
            const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);
            return hoursUntilDeadline < 24 && hoursUntilDeadline > 0;
        });
    }
    
    getTodayTasks() {
        const today = new Date().toDateString();
        return this.tasks.filter(task => {
            const deadline = new Date(task.deadline).toDateString();
            return deadline === today;
        });
    }
    
    getOverdueTasks() {
        const now = new Date();
        return this.tasks.filter(task => {
            if (task.completed) return false;
            const deadline = new Date(task.deadline);
            return deadline < now;
        });
    }
    
    getTodayCompletedTasks() {
        const today = new Date().toDateString();
        return this.tasks.filter(task => {
            if (!task.completed || !task.completedAt) return false;
            const completedDate = new Date(task.completedAt).toDateString();
            return completedDate === today;
        });
    }
    
    searchTasks(query) {
        if (!query.trim()) {
            this.updateTasksDisplay();
            return;
        }
        
        const container = document.getElementById('tasksContainer');
        const emptyState = document.getElementById('emptyState');
        
        const filteredTasks = this.tasks.filter(task => 
            task.name.toLowerCase().includes(query.toLowerCase()) ||
            task.description.toLowerCase().includes(query.toLowerCase()) ||
            task.category.toLowerCase().includes(query.toLowerCase())
        );
        
        if (filteredTasks.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            emptyState.querySelector('h3').textContent = 'No quests found';
            emptyState.querySelector('p').textContent = `No quests match "${query}"`;
        } else {
            container.style.display = 'grid';
            emptyState.style.display = 'none';
            container.innerHTML = filteredTasks.map(task => this.createTaskCard(task)).join('');
            this.addTaskCardListeners();
        }
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.updateTasksDisplay();
    }
    
    setView(view) {
        this.currentView = view;
        
        // Update active view button
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Update container class
        const container = document.getElementById('tasksContainer');
        container.className = `tasks-container ${view}-view`;
    }
    
    // Navigation
    switchSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        document.getElementById(`${sectionName}-section`).classList.add('active');
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === sectionName);
        });
        
        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            tasks: 'My Quests',
            progress: 'Progress',
            wallet: 'Wallet',
            leaderboard: 'Leaderboard',
            profile: 'Profile',
            settings: 'Settings'
        };
        
        document.getElementById('pageTitle').textContent = titles[sectionName] || sectionName;
        this.currentSection = sectionName;
        
        // Close mobile menu if open
        document.getElementById('sidebar').classList.remove('open');
    }
    
    // Profile Management
    updateProfile() {
        const newName = document.getElementById('profileNameInput').value.trim();
        const newEmail = document.getElementById('profileEmail').value.trim();
        
        if (!newName) {
            this.showNotification('Please enter a valid name', 'error');
            return;
        }
        
        this.currentUser.name = newName;
        this.currentUser.email = newEmail;
        
        this.saveData();
        this.updateUI();
        
        this.showNotification('Profile updated successfully!', 'success');
    }
    
    // Settings Management
    updateSettings() {
        this.settings.emailNotifications = document.getElementById('emailNotifications').checked;
        this.settings.pushNotifications = document.getElementById('pushNotifications').checked;
        this.settings.soundEffects = document.getElementById('soundEffects').checked;
        this.settings.theme = document.getElementById('themeSelect').value;
        this.settings.accentColor = document.getElementById('accentColor').value;
        
        this.applyTheme();
        this.saveData();
        
        this.showNotification('Settings updated!', 'success');
    }
    
    applyTheme() {
        // This is a simplified theme application
        // In a real app, you'd have more sophisticated theming
        document.documentElement.style.setProperty('--primary-color', this.settings.accentColor);
    }
    
    // Data Management
    exportData() {
        const exportData = {
            user: this.currentUser,
            tasks: this.tasks,
            achievements: this.achievements,
            settings: this.settings,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `questmaster-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('Data exported successfully!', 'success');
    }
    
    importData(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (confirm('This will replace all current data. Are you sure?')) {
                    this.currentUser = importedData.user || this.currentUser;
                    this.tasks = importedData.tasks || [];
                    this.achievements = importedData.achievements || this.achievements;
                    this.settings = importedData.settings || this.settings;
                    
                    this.saveData();
                    this.updateUI();
                    this.applyTheme();
                    
                    this.showNotification('Data imported successfully!', 'success');
                }
            } catch (error) {
                this.showNotification('Invalid backup file', 'error');
            }
        };
        reader.readAsText(file);
    }
    
    clearAllData() {
        if (!confirm('This will delete ALL data permanently. Are you sure?')) return;
        
        if (!confirm('This action cannot be undone. Continue?')) return;
        
        localStorage.removeItem('questmaster_user');
        localStorage.removeItem('questmaster_tasks');
        localStorage.removeItem('questmaster_achievements');
        localStorage.removeItem('questmaster_settings');
        localStorage.removeItem('last_activity_date');
        
        // Reset to defaults
        this.currentUser = {
            name: 'Quest Master',
            level: 1,
            coins: 50,
            streak: 0,
            totalTasks: 0,
            completedTasks: 0,
            email: '',
            joinDate: new Date()
        };
        this.tasks = [];
        this.achievements.forEach(a => a.unlocked = false);
        
        this.updateUI();
        this.showNotification('All data cleared', 'info');
    }
    
    // Animations and Effects
    showCoinAnimation(amount) {
        const coinElement = document.getElementById('coinAnimation');
        coinElement.querySelector('span').textContent = `+${amount}`;
        coinElement.style.display = 'flex';
        
        setTimeout(() => {
            coinElement.style.display = 'none';
        }, 1000);
    }
    
    showLevelUpAnimation(newLevel) {
        const levelUpElement = document.getElementById('levelUpAnimation');
        levelUpElement.querySelector('#newLevel').textContent = newLevel;
        levelUpElement.style.display = 'flex';
        
        setTimeout(() => {
            levelUpElement.style.display = 'none';
        }, 2000);
    }
    
    showAchievementNotification(achievement) {
        const notification = document.getElementById('achievementNotification');
        notification.querySelector('#achievementTitle').textContent = achievement.name;
        notification.querySelector('#achievementDescription').textContent = achievement.description;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 5000);
    }
    
    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification-item ${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
    
    showLoadingScreen() {
        document.getElementById('loadingOverlay').classList.add('show');
    }
    
    hideLoadingScreen() {
        document.getElementById('loadingOverlay').classList.remove('show');
    }
    
    // Sound Effects
    playSound(soundType) {
        if (!this.settings.soundEffects) return;
        
        // Create audio context and play sound
        // This is a simplified implementation
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Generate different tones for different sound types
        const frequencies = {
            task_created: 440,
            task_complete: 660,
            coin_earned: 880,
            level_up: [440, 550, 660, 880],
            achievement: [330, 440, 550, 660]
        };
        
        const freq = frequencies[soundType] || 440;
        
        if (Array.isArray(freq)) {
            // Play sequence for complex sounds
            freq.forEach((f, index) => {
                setTimeout(() => {
                    this.playTone(audioContext, f, 0.1);
                }, index * 100);
            });
        } else {
            this.playTone(audioContext, freq, 0.2);
        }
    }
    
    playTone(audioContext, frequency, duration) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }
    
    // Recent Activity
    addRecentActivity(text, icon, type) {
        const activityList = document.getElementById('recentActivity');
        if (!activityList) return;
        
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <i class="fas fa-${icon} text-${type}"></i>
            <span>${text}</span>
            <small>Just now</small>
        `;
        
        activityList.insertBefore(activityItem, activityList.firstChild);
        
        // Keep only last 10 activities
        while (activityList.children.length > 10) {
            activityList.removeChild(activityList.lastChild);
        }
    }
    
    // Keyboard Shortcuts
    handleKeyboardShortcuts(e) {
        // Only handle shortcuts when not in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'n':
                    e.preventDefault();
                    this.switchSection('tasks');
                    document.getElementById('taskName')?.focus();
                    break;
                case 'f':
                    e.preventDefault();
                    document.getElementById('searchInput')?.focus();
                    break;
                case 's':
                    e.preventDefault();
                    this.saveData();
                    this.showNotification('Data saved!', 'success');
                    break;
            }
        }
        
        // Section shortcuts
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            switch (e.key) {
                case '1':
                    this.switchSection('dashboard');
                    break;
                case '2':
                    this.switchSection('tasks');
                    break;
                case '3':
                    this.switchSection('progress');
                    break;
                case '4':
                    this.switchSection('wallet');
                    break;
                case '5':
                    this.switchSection('leaderboard');
                    break;
                case '6':
                    this.switchSection('profile');
                    break;
                case '7':
                    this.switchSection('settings');
                    break;
                case 'Escape':
                    // Close any open modals
                    document.querySelectorAll('.modal.show').forEach(modal => {
                        modal.classList.remove('show');
                    });
                    break;
            }
        }
    }
    
    // Utility Functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    formatDate(date) {
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays === -1) return 'Yesterday';
        if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
        if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
        
        return date.toLocaleDateString();
    }
    
    getCategoryEmoji(category) {
        const emojis = {
            work: '💼',
            personal: '👤',
            health: '💪',
            learning: '📚',
            creative: '🎨',
            social: '👥',
            finance: '💰',
            home: '🏠'
        };
        return emojis[category] || '📝';
    }
    
    getAchievementIcon(achievementId) {
        const icons = {
            first_quest: 'medal',
            streak_master: 'fire',
            quiz_champion: 'brain',
            task_master: 'crown',
            early_bird: 'sunrise'
        };
        return icons[achievementId] || 'trophy';
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle'
        };
        return icons[type] || 'bell';
    }
    
    // Periodic Updates
    startPeriodicUpdates() {
        // Update time-sensitive elements every minute
        setInterval(() => {
            this.updateTasksDisplay(); // Refresh overdue/urgent status
            this.updateProgressRing();
            this.updateTimeBasedElements();
        }, 60000);
        
        // Save data every 5 minutes
        setInterval(() => {
            this.saveData();
        }, 300000);
    }
    
    updateTimeBasedElements() {
        // Update relative time displays
        document.querySelectorAll('.task-deadline').forEach(element => {
            const taskCard = element.closest('.task-card');
            const taskId = taskCard?.dataset.taskId;
            const task = this.tasks.find(t => t.id === taskId);
            
            if (task) {
                const deadline = new Date(task.deadline);
                element.querySelector('span').textContent = this.formatDate(deadline);
                
                // Update urgency classes
                const now = new Date();
                const isOverdue = deadline < now && !task.completed;
                const isUrgent = (deadline - now) / (1000 * 60 * 60) < 24 && !task.completed;
                
                element.className = `task-deadline ${isOverdue ? 'overdue' : isUrgent ? 'urgent' : ''}`;
            }
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.questMaster = new QuestMaster();
});

// Handle page visibility changes to update streaks and time-based elements
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.questMaster) {
        window.questMaster.updateTimeBasedElements();
        window.questMaster.updateProgressRing();
    }
});

// Handle beforeunload to save data
window.addEventListener('beforeunload', () => {
    if (window.questMaster) {
        window.questMaster.saveData();
    }
});