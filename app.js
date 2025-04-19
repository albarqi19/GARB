const { createApp, ref, computed } = Vue;

// تهيئة Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDUgjgPoMLUPMqMuxLI3SAY54x84Wl-_vc",
  authDomain: "garb1-4820a.firebaseapp.com",
  databaseURL: "https://garb1-4820a-default-rtdb.firebaseio.com",
  projectId: "garb1-4820a",
  storageBucket: "garb1-4820a.firebasestorage.app",
  messagingSenderId: "809840688426",
  appId: "1:809840688426:web:f873f2f1dd27b829d43253",
  measurementId: "G-XT8DMSBT3M"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const app = createApp({
    setup() {
        // Admin panel state
        const showAdmin = ref(false);
        // Admin button visibility - hidden by default
        const adminButtonVisible = ref(false);
        // Secret counter for logo clicks
        const secretClickCounter = ref(0);
        // Timer for resetting click counter
        let clickTimer = null;
        // حالة التحميل
        const isLoading = ref(false);
        // حالة تهيئة التطبيق
        const isInitialized = ref(false);

        // New phase form
        const newPhase = ref({
            title: '',
            description: '',
            status: 'pending',
            tasks: []
        });

        // New task form
        const newTask = ref({
            phaseId: null,
            name: ''
        });

        // Edit phase mode
        const editingPhase = ref(null);

        // Original phases data backup for reset functionality
        const originalPhases = [
            {
                id: 1,
                title: "جمع وإعداد البيانات",
                description: "المرحلة الأولى: جمع وتنظيم بيانات النظام الأساسية",
                status: "in-progress",
                tasks: [
                    { id: 1, name: "جمع بيانات الموظفين", completed: true },
                    { id: 2, name: "إصلاح ودمج البيانات", completed: true },
                    { id: 3, name: "ربط الأسماء بأرقام الهوية", completed: false },
                    { id: 4, name: "التحقق من دقة البيانات", completed: false }
                ]
            },
            {
                id: 2,
                title: "تطوير قاعدة البيانات",
                description: "تصميم وإنشاء قاعدة البيانات وإدارة الصلاحيات",
                status: "pending",
                tasks: [
                    { id: 1, name: "تصميم هيكل قاعدة البيانات", completed: false },
                    { id: 2, name: "إنشاء قاعدة البيانات الرئيسية", completed: false },
                    { id: 3, name: "تطوير نظام إدارة الصلاحيات", completed: false },
                    { id: 4, name: "اختبار أداء وأمان قاعدة البيانات", completed: false }
                ]
            },
            {
                id: 3,
                title: "تطوير هوية المنصة",
                description: "تصميم الهوية البصرية وواجهات المستخدم",
                status: "pending",
                tasks: [
                    { id: 1, name: "إنشاء هوية واسم للمنصة", completed: false },
                    { id: 2, name: "تصميم الشعار والألوان", completed: false },
                    { id: 3, name: "تصميم قوالب الواجهات الرئيسية", completed: false }
                ]
            },
            {
                id: 4,
                title: "تطوير لوحة التحكم",
                description: "بناء لوحة تحكم المنصة وصفحاتها الأساسية",
                status: "pending",
                tasks: [
                    { id: 1, name: "إعداد هيكل لوحة التحكم", completed: false },
                    { id: 2, name: "تطوير الصفحات الأساسية للوحة التحكم", completed: false },
                    { id: 3, name: "بناء واجهات إدارة المستخدمين والطلاب", completed: false },
                    { id: 4, name: "تطوير تقارير وإحصائيات المركز", completed: false }
                ]
            },
            {
                id: 5,
                title: "التكامل والتطوير المتقدم",
                description: "دمج الخدمات الخارجية والتقنيات المتقدمة",
                status: "pending",
                tasks: [
                    { id: 1, name: "ربط المنصة بخدمة الواتساب", completed: false },
                    { id: 2, name: "دمج تقنيات الذكاء الاصطناعي", completed: false },
                    { id: 3, name: "تطوير النظام الآلي للإشعارات", completed: false },
                    { id: 4, name: "اختبار التكامل والأداء", completed: false }
                ]
            },
            {
                id: 6,
                title: "الاختبار والإطلاق",
                description: "اختبار الأداء والأمان وإطلاق المنصة",
                status: "pending",
                tasks: [
                    { id: 1, name: "اختبار كامل للمنصة", completed: false },
                    { id: 2, name: "تجربة المنصة مع مستخدمين تجريبيين", completed: false },
                    { id: 3, name: "إصلاح الأخطاء وتحسين الأداء", completed: false },
                    { id: 4, name: "إطلاق المنصة رسمياً", completed: false }
                ]
            }
        ];

        // Create a deep copy of original phases for reactivity
        const phases = ref(JSON.parse(JSON.stringify(originalPhases)));

        // تعيين تاريخ محدد (8 مايو 2025) للعد التنازلي
        const launchDate = ref(new Date(2025, 4, 10)); // شهر مايو هو الشهر 4 (الأشهر تبدأ من 0)
        
        // الوقت المتبقي للعد التنازلي
        const countdown = ref({
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        });
        
        // دالة تحديث العد التنازلي
        const updateCountdown = () => {
            const now = new Date();
            const timeLeft = launchDate.value.getTime() - now.getTime();
            
            if (timeLeft <= 0) {
                countdown.value = { days: 0, hours: 0, minutes: 0, seconds: 0 };
                return;
            }
            
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            
            countdown.value = { days, hours, minutes, seconds };
        };

        // Firebase وظائف التعامل مع

        // جلب البيانات من Firebase
        const fetchPhasesFromFirebase = async () => {
            try {
                isLoading.value = true;
                const phasesRef = database.ref('phases');
                
                // استخدام طريقة get بدلاً من on للحصول على البيانات مرة واحدة
                const snapshot = await phasesRef.get();
                const data = snapshot.val();
                
                if (data) {
                    // تحويل البيانات من تنسيق القاموس إلى مصفوفة
                    const phasesArray = Object.values(data);
                    // ترتيب المراحل حسب معرف المرحلة
                    phasesArray.sort((a, b) => a.id - b.id);
                    phases.value = phasesArray;
                    console.log('تم جلب البيانات:', phasesArray);
                } else {
                    // إذا لم تكن هناك بيانات، نستخدم البيانات الافتراضية ونحفظها
                    console.log('لا توجد بيانات، استخدام البيانات الافتراضية');
                    saveToFirebase();
                }
                
                // بعد جلب البيانات، نبدأ بمراقبة التغييرات في الوقت الفعلي
                setupRealtimeUpdates();
                
            } catch (error) {
                console.error('خطأ في جلب البيانات:', error);
                showNotification('حدث خطأ أثناء جلب البيانات');
            } finally {
                isLoading.value = false;
            }
        };

        // حفظ البيانات في Firebase
        const saveToFirebase = async () => {
            try {
                isLoading.value = true;
                
                // تسجيل البيانات التي سيتم حفظها للتصحيح
                console.log('حفظ البيانات في Firebase:', phases.value);
                
                // حفظ كل مرحلة كعنصر منفصل في قاعدة البيانات
                const phasesRef = database.ref('phases');
                
                // حذف البيانات الحالية ثم إضافة البيانات الجديدة
                await phasesRef.set({}); // استخدام set بدلاً من remove لتجنب مشاكل التزامن
                
                // إضافة كل مرحلة كعنصر منفصل مع استخدام معرف المرحلة كمفتاح
                const updates = {};
                for (const phase of phases.value) {
                    updates[phase.id.toString()] = phase;
                }
                
                // تحديث كل المراحل دفعة واحدة باستخدام update
                await phasesRef.update(updates);
                
                showNotification('تم حفظ البيانات بنجاح!');
            } catch (error) {
                console.error('خطأ في حفظ البيانات:', error);
                showNotification('حدث خطأ أثناء حفظ البيانات');
            } finally {
                isLoading.value = false;
            }
        };

        // إعداد التحديثات في الوقت الفعلي
        const setupRealtimeUpdates = () => {
            const phasesRef = database.ref('phases');
            
            // الاستماع للتغييرات في قاعدة البيانات
            phasesRef.on('value', (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    // تحويل البيانات من تنسيق القاموس إلى مصفوفة
                    const phasesArray = Object.values(data);
                    // ترتيب المراحل حسب معرف المرحلة
                    phasesArray.sort((a, b) => a.id - b.id);
                    
                    // نتحقق ما إذا كانت البيانات مختلفة عن البيانات الحالية
                    const currentData = JSON.stringify(phases.value);
                    const newData = JSON.stringify(phasesArray);
                    
                    if (currentData !== newData) {
                        console.log('تم استلام تحديث من قاعدة البيانات');
                        phases.value = phasesArray;
                        
                        // منع إغلاق لوحة الإدمن عند تحديث البيانات إذا كانت مفتوحة بالفعل
                        // لا نقوم بتغيير حالة لوحة الإدمن هنا
                    }
                }
                
                // تعيين حالة التهيئة إلى true بعد استلام البيانات
                isInitialized.value = true;
            }, (error) => {
                console.error('خطأ في مراقبة التغييرات:', error);
                isInitialized.value = true;
            });
        };

        // مراقبة تغييرات المهام وحفظها تلقائياً
        const watchTaskChanges = () => {
            let saveTimeout = null;
            
            // إضافة watcher لمراقبة تغييرات phases
            Vue.watch(
                phases,
                () => {
                    // منع تنفيذ الحفظ عدة مرات متتالية عند حدوث تغييرات متعددة
                    clearTimeout(saveTimeout);
                    saveTimeout = setTimeout(() => {
                        saveToFirebase();
                        updateLastUpdated();
                    }, 1000); // تأخير الحفظ لمدة ثانية واحدة للسماح بتجميع التغييرات
                },
                { deep: true } // مراقبة عميقة للكشف عن أي تغيير في الكائن
            );
        };

        // Secret method to handle logo clicks
        const handleLogoClick = () => {
            // Clear any existing timer
            clearTimeout(clickTimer);

            // Increment click counter
            secretClickCounter.value++;

            // Check if we reached the threshold (10 clicks)
            if (secretClickCounter.value >= 10) {
                adminButtonVisible.value = !adminButtonVisible.value;
                secretClickCounter.value = 0; // Reset counter

                // Show a subtle notification
                if (adminButtonVisible.value) {
                    showNotification('تم تنشيط وضع المشرف');
                } else {
                    showNotification('تم إلغاء تنشيط وضع المشرف');
                }
            }

            // Set timeout to reset counter if clicks are too slow (3 seconds)
            clickTimer = setTimeout(() => {
                secretClickCounter.value = 0;
            }, 3000);
        };

        // Secret keyboard shortcut handler - will be added to the window in mounted
        const handleKeyboardShortcut = (event) => {
            // Check for Ctrl+Alt+A combination
            if (event.ctrlKey && event.altKey && event.key === 'a') {
                adminButtonVisible.value = !adminButtonVisible.value;

                // Show a subtle notification
                if (adminButtonVisible.value) {
                    showNotification('تم تنشيط وضع المشرف');
                } else {
                    showNotification('تم إلغاء تنشيط وضع المشرف');
                }

                // Prevent default browser behavior
                event.preventDefault();
            }
        };

        // Notification system
        const notification = ref({
            show: false,
            message: '',
            timer: null
        });

        const showNotification = (message) => {
            // Clear any existing timer
            if (notification.value.timer) {
                clearTimeout(notification.value.timer);
            }

            // Show new notification
            notification.value.message = message;
            notification.value.show = true;

            // Auto-hide after 3 seconds
            notification.value.timer = setTimeout(() => {
                notification.value.show = false;
            }, 3000);
        };

        // Toggle admin panel
        const toggleAdmin = () => {
            showAdmin.value = !showAdmin.value;
            // حفظ حالة لوحة الإدمن في localStorage
            localStorage.setItem('showAdmin', showAdmin.value);
        };

        // Update phase status
        const updatePhaseStatus = (phaseId, event) => {
            const phase = phases.value.find(p => p.id === phaseId);
            if (phase) {
                phase.status = event.target.value;

                // If phase is completed, mark all tasks as completed
                if (phase.status === 'completed') {
                    phase.tasks.forEach(task => {
                        task.completed = true;
                    });
                }

                // If phase is pending, mark all tasks as not completed
                if (phase.status === 'pending') {
                    phase.tasks.forEach(task => {
                        task.completed = false;
                    });
                }
                
                // حفظ التغييرات تلقائيًا
                saveToFirebase();
            }
        };

        // CRUD operations for phases and tasks

        // Add a new phase
        const addPhase = () => {
            if (!newPhase.value.title.trim()) {
                alert('يرجى إدخال عنوان المرحلة');
                return;
            }

            // Find the highest id and increment it
            const maxId = phases.value.length > 0
                ? Math.max(...phases.value.map(phase => phase.id))
                : 0;

            const phase = {
                id: maxId + 1,
                title: newPhase.value.title,
                description: newPhase.value.description || 'وصف المرحلة',
                status: newPhase.value.status,
                tasks: []
            };

            phases.value.push(phase);

            // Reset the form
            newPhase.value = {
                title: '',
                description: '',
                status: 'pending',
                tasks: []
            };

            showNotification('تم إضافة المرحلة بنجاح');
        };

        // Delete a phase
        const deletePhase = (phaseId) => {
            if (confirm('هل أنت متأكد من حذف هذه المرحلة؟ سيتم حذف جميع المهام المرتبطة بها.')) {
                phases.value = phases.value.filter(p => p.id !== phaseId);
                showNotification('تم حذف المرحلة بنجاح');
            }
        };

        // Start editing a phase
        const startEditPhase = (phase) => {
            editingPhase.value = {
                id: phase.id,
                title: phase.title,
                description: phase.description,
                status: phase.status
            };
        };

        // Cancel editing a phase
        const cancelEditPhase = () => {
            editingPhase.value = null;
        };

        // Save phase edits
        const savePhaseEdit = () => {
            if (!editingPhase.value.title.trim()) {
                alert('يرجى إدخال عنوان المرحلة');
                return;
            }

            const index = phases.value.findIndex(p => p.id === editingPhase.value.id);
            if (index !== -1) {
                // Keep the tasks while updating other properties
                const tasks = phases.value[index].tasks;

                phases.value[index] = {
                    ...editingPhase.value,
                    tasks: tasks
                };

                showNotification('تم تحديث المرحلة بنجاح');
                editingPhase.value = null;
            }
        };

        // Add task to a phase
        const addTask = (phaseId) => {
            if (!newTask.value.name.trim()) {
                alert('يرجى إدخال اسم المهمة');
                return;
            }

            const phaseIndex = phases.value.findIndex(p => p.id === phaseId);
            if (phaseIndex !== -1) {
                // Find the highest task id in this phase
                const maxTaskId = phases.value[phaseIndex].tasks.length > 0
                    ? Math.max(...phases.value[phaseIndex].tasks.map(task => task.id))
                    : 0;

                phases.value[phaseIndex].tasks.push({
                    id: maxTaskId + 1,
                    name: newTask.value.name,
                    completed: false
                });

                // Reset the form
                newTask.value = {
                    phaseId: null,
                    name: ''
                };

                showNotification('تم إضافة المهمة بنجاح');
            }
        };

        // Delete a task
        const deleteTask = (phaseId, taskId) => {
            if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
                const phaseIndex = phases.value.findIndex(p => p.id === phaseId);
                if (phaseIndex !== -1) {
                    phases.value[phaseIndex].tasks = phases.value[phaseIndex].tasks.filter(t => t.id !== taskId);
                    showNotification('تم حذف المهمة بنجاح');
                }
            }
        };

        // Save changes to both local storage and Firebase
        const saveChanges = async () => {
            // حفظ في التخزين المحلي للاحتياط
            localStorage.setItem('projectPhases', JSON.stringify(phases.value));
            localStorage.setItem('adminEnabled', adminButtonVisible.value);
            
            // حفظ في Firebase
            await saveToFirebase();
            
            // تحديث تاريخ آخر تحديث
            updateLastUpdated();
        };

        // Reset phases to original state
        const resetPhases = async () => {
            if (confirm('هل أنت متأكد من إعادة تعيين جميع المراحل؟ سيتم حذف جميع التقدم المحفوظ.')) {
                phases.value = JSON.parse(JSON.stringify(originalPhases));
                localStorage.removeItem('projectPhases');
                
                // إعادة تعيين البيانات في Firebase أيضاً
                await saveToFirebase();
                
                showNotification('تم إعادة تعيين المراحل بنجاح!');
            }
        };

        // Load saved data if exists
        const loadSavedData = async () => {
            try {
                // محاولة جلب البيانات من Firebase أولاً
                await fetchPhasesFromFirebase();
                
                // إذا فشلت العملية، استخدام التخزين المحلي كاحتياطي
                if (phases.value.length === 0) {
                    const savedPhases = localStorage.getItem('projectPhases');
                    if (savedPhases) {
                        phases.value = JSON.parse(savedPhases);
                        
                        // حفظ البيانات المحلية إلى Firebase
                        await saveToFirebase();
                    }
                }

                // تعيين حالة التهيئة إلى true بعد تحميل البيانات
                isInitialized.value = true;
                
            } catch (error) {
                console.error('خطأ في تحميل البيانات:', error);
                
                // في حالة الخطأ، استخدام التخزين المحلي
                const savedPhases = localStorage.getItem('projectPhases');
                if (savedPhases) {
                    phases.value = JSON.parse(savedPhases);
                }
                
                // تعيين حالة التهيئة إلى true حتى في حالة الخطأ
                isInitialized.value = true;
            }
        };

        // Call load on startup
        loadSavedData();

        // Calculate overall project progress
        const overallProgress = computed(() => {
            const totalTasks = phases.value.reduce((acc, phase) => acc + phase.tasks.length, 0);
            const completedTasks = phases.value.reduce((acc, phase) => {
                return acc + phase.tasks.filter(task => task.completed).length;
            }, 0);

            return Math.round((completedTasks / totalTasks) * 100);
        });

        // Calculate total tasks
        const totalTasks = computed(() => {
            return phases.value.reduce((acc, phase) => acc + phase.tasks.length, 0);
        });

        // Calculate completed tasks count
        const completedTasksCount = computed(() => {
            return phases.value.reduce((acc, phase) => {
                return acc + phase.tasks.filter(task => task.completed).length;
            }, 0);
        });

        // Calculate remaining phases count
        const remainingPhasesCount = computed(() => {
            return phases.value.filter(phase => phase.status !== 'completed').length;
        });

        // Helper function to get phase status text in Arabic
        const getStatusText = (status) => {
            switch (status) {
                case 'completed':
                    return 'مكتمل';
                case 'in-progress':
                    return 'جاري العمل';
                case 'pending':
                    return 'قيد الانتظار';
                default:
                    return '';
            }
        };

        // Calculate last updated date
        const lastUpdated = ref(new Date(2025, 3, 19)); // April 19, 2025
        const formattedDate = computed(() => {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return lastUpdated.value.toLocaleDateString('ar-SA', options);
        });

        // Update last updated date when changes are saved
        const updateLastUpdated = () => {
            lastUpdated.value = new Date();
            localStorage.setItem('lastUpdated', lastUpdated.value.toISOString());
        };

        // Add event listener for keyboard shortcut when the app is mounted
        Vue.onMounted(() => {
            window.addEventListener('keydown', handleKeyboardShortcut);

            // تأكد من تحميل حالة لوحة الإدمن من localStorage في بداية التطبيق
            const savedShowAdmin = localStorage.getItem('showAdmin');
            const isAdminEnabled = localStorage.getItem('adminEnabled');
            
            if (isAdminEnabled === 'true') {
                adminButtonVisible.value = true;
            }
            
            // فقط إذا كان savedShowAdmin موجوداً، قم بتعيين showAdmin بناءً عليه
            if (savedShowAdmin) {
                showAdmin.value = savedShowAdmin === 'true';
            }

            // Load last updated date if available
            const savedLastUpdated = localStorage.getItem('lastUpdated');
            if (savedLastUpdated) {
                lastUpdated.value = new Date(savedLastUpdated);
            }

            // Start countdown timer
            setInterval(() => {
                updateCountdown();
            }, 1000); // Update every second
            
            // جلب البيانات عند بدء التطبيق
            loadSavedData();
            
            // بدء مراقبة التغييرات في المهام
            watchTaskChanges();
        });

        // Remove event listener when the app is unmounted
        Vue.onUnmounted(() => {
            window.removeEventListener('keydown', handleKeyboardShortcut);
            // إلغاء الاشتراك في تحديثات Firebase
            database.ref('phases').off();
        });

        return {
            phases,
            showAdmin,
            adminButtonVisible,
            notification,
            overallProgress,
            getStatusText,
            formattedDate,
            toggleAdmin,
            handleLogoClick,
            updatePhaseStatus,
            saveChanges,
            resetPhases,
            totalTasks,
            completedTasksCount,
            remainingPhasesCount,
            isLoading,
            // Countdown export
            countdown,
            // New CRUD operations
            newPhase,
            addPhase,
            deletePhase,
            editingPhase,
            startEditPhase,
            cancelEditPhase,
            savePhaseEdit,
            newTask,
            addTask,
            deleteTask,
            updateLastUpdated
        };
    }
});

app.mount('#app');