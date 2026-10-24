document.addEventListener('DOMContentLoaded', () => {
    
    const envBtn = document.getElementById('open-envelope-btn');
    const envScreen = document.getElementById('envelope-screen');
    const mainContent = document.getElementById('main-content');
    const musicBtn = document.getElementById('music-btn');
    const bgMusic = document.getElementById('bg-music');
    let mapInitialized = false;

    // 1. Плавный Intersection Observer для элементов при скролле
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    // 2. Логика Конверта
    if(envBtn) {
        envBtn.addEventListener('click', () => {
            envBtn.classList.add('open');
            bgMusic.play().catch(() => console.log("Auto-play prevented"));
            musicBtn.classList.remove('pulse-anim');
            musicBtn.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;

            // Даем пользователю посмотреть на выезжающее письмо 2 секунды
            setTimeout(() => {
                envScreen.style.opacity = '0';
                setTimeout(() => {
                    envScreen.style.display = 'none';
                    mainContent.classList.remove('hidden');
                    window.scrollTo(0,0);
                    
                    // Запускаем отслеживание скролла только когда основной сайт открыт
                    document.querySelectorAll('.anim-on-scroll').forEach(el => observer.observe(el));
                    
                    // Инициализация карты 2GIS
                    if (!mapInitialized && typeof DG !== 'undefined') {
                        DG.then(function() {
                            var map = DG.map('map', {
                                center: [43.329644, 77.035326],
                                zoom: 16,
                                fullscreenControl: false
                            });
                            DG.marker([43.329644, 77.035326]).addTo(map).bindPopup('<b>Royal Hall</b><br>Кульджинский тракт, 39/2');
                        });
                        mapInitialized = true;
                    }
                }, 1000); // время на затухание (opacity) конверта
            }, 2000); // ожидание пока письмо выедет
        });
    }

    // 3. Плеер
    if(musicBtn) {
        musicBtn.addEventListener('click', () => {
            if (bgMusic.paused) {
                bgMusic.play();
                musicBtn.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
            } else {
                bgMusic.pause();
                musicBtn.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>`;
            }
        });
    }

    // 4. Таймер
    const countDownDate = new Date("Nov 20, 2026 17:00:00").getTime();
    if (document.getElementById('countdown')) {
        setInterval(() => {
            const now = new Date().getTime();
            const distance = countDownDate - now;
            if (distance < 0) return;
            document.getElementById("days").innerText = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
            document.getElementById("hours").innerText = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
            document.getElementById("minutes").innerText = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
            document.getElementById("seconds").innerText = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
        }, 1000);
    }

    // 5. Отправка форм (Fetch)
    const csrf = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

    async function submitForm(url, data, msgId, form) {
        const msgEl = document.getElementById(msgId);
        msgEl.innerText = "Отправка...";
        msgEl.style.color = "var(--gray)";
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            msgEl.innerText = result.msg;
            msgEl.style.color = result.status === 'success' ? '#2e7d32' : '#c62828';
            
            if(result.status === 'success') {
                form.reset();
                if(data.action === 'wish') {
                    const c = document.getElementById('wishes-container');
                    c.insertAdjacentHTML('afterbegin', `<div class="wish-item glass-panel anim-on-scroll visible"><div class="wish-quotes">"</div><p class="wish-text">${data.text}</p><p class="wish-author">— ${data.name}</p></div>`);
                }
            }
        } catch (e) {
            msgEl.innerText = "Ошибка соединения";
            msgEl.style.color = "#c62828";
        }
    }

    const rForm = document.getElementById('rsvp-form');
    if(rForm) rForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitForm('/', {
            action: 'rsvp',
            first_name: document.getElementById('guest_first').value,
            last_name: document.getElementById('guest_last').value,
            status: document.querySelector('input[name="status"]:checked').value
        }, 'rsvp-msg', rForm);
    });

    const wForm = document.getElementById('wish-form');
    if(wForm) wForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitForm('/', {
            action: 'wish',
            name: document.getElementById('wish_name').value,
            text: document.getElementById('wish_text').value
        }, 'wish-msg', wForm);
    });
});