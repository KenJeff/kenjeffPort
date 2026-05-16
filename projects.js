document.addEventListener('DOMContentLoaded', () => {

    const overlay = document.getElementById('modal-overlay');
    const closeBtn = document.getElementById('modal-close');
    const modalVideo = document.getElementById('modal-video');
    const modalTag = document.getElementById('modal-tag');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalChips = document.getElementById('modal-chips');
    const modalBox = document.getElementById('modal');

    let currentSlide = 0;
    let slides = [];
    let slideType = ''; // 'image' or 'video'

    // Force all styles inline to bypass any CSS conflicts
    Object.assign(overlay.style, {
        display: 'none',
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '9999',
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(6px)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        boxSizing: 'border-box',
    });

    Object.assign(modalBox.style, {
        background: '#1c1c1c',
        border: '1px solid #2e2e2e',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '780px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        margin: 'auto',
        paddingBottom: '1%',
        paddingLeft: '1%',
        paddingRight: '1%',
    });

    Object.assign(modalVideo.style, {
        width: '100%',
        aspectRatio: '16/9',
        background: '#000',
        borderRadius: '16px 16px 0 0',
        overflow: 'hidden',
        position: 'relative',
    });

    Object.assign(closeBtn.style, {
        position: 'absolute',
        top: '0rem',
        left: '1rem',
        background: 'transparent',
        border: '.5px solid transparent',
        color: '#fefaef',
        fontSize: '2rem',
        fontFamily: "'Syne', sans-serif",
        fontWeight: '700',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '10',
    });

    // ── Shared slideshow builder (images & videos) ──
    function buildSlideshow(items, type) {
        slides = items;
        slideType = type;
        currentSlide = 0;

        modalVideo.innerHTML = `
            <div id="gallery-wrap" style="
                width:100%; height:100%; position:relative;
                display:flex; align-items:center; justify-content:center;
                background:#000; border-radius:16px 16px 0 0; overflow:hidden;
            ">
                <div id="slide-content" style="width:100%;height:100%;"></div>

                ${items.length > 1 ? `
                <button id="gallery-prev" style="
                    position:absolute; left:12px; top:50%; transform:translateY(-50%);
                    background:rgba(0,0,0,0.55); border:1px solid rgba(255,255,255,0.15);
                    color:#fff; font-size:1.4rem; width:40px; height:40px;
                    border-radius:50%; cursor:pointer; display:flex;
                    align-items:center; justify-content:center; z-index:10;
                    transition: background 0.2s;
                ">‹</button>

                <button id="gallery-next" style="
                    position:absolute; right:12px; top:50%; transform:translateY(-50%);
                    background:rgba(0,0,0,0.55); border:1px solid rgba(255,255,255,0.15);
                    color:#fff; font-size:1.4rem; width:40px; height:40px;
                    border-radius:50%; cursor:pointer; display:flex;
                    align-items:center; justify-content:center; z-index:10;
                    transition: background 0.2s;
                ">›</button>

                <div id="gallery-dots" style="
                    position:absolute; bottom:10px; left:50%; transform:translateX(-50%);
                    display:flex; gap:6px; z-index:10;
                ">
                    ${items.map((_, i) => `
                        <div class="gallery-dot" data-index="${i}" style="
                            width:8px; height:8px; border-radius:50%;
                            background:${i === 0 ? '#fc6600' : 'rgba(255,255,255,0.35)'};
                            cursor:pointer; transition:background 0.2s;
                        "></div>
                    `).join('')}
                </div>
                ` : ''}
            </div>
        `;

        updateSlide();

        if (items.length > 1) {
            document.getElementById('gallery-prev').addEventListener('click', (e) => {
                e.stopPropagation();
                currentSlide = (currentSlide - 1 + slides.length) % slides.length;
                updateSlide();
            });

            document.getElementById('gallery-next').addEventListener('click', (e) => {
                e.stopPropagation();
                currentSlide = (currentSlide + 1) % slides.length;
                updateSlide();
            });

            document.querySelectorAll('.gallery-dot').forEach(dot => {
                dot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    currentSlide = parseInt(dot.dataset.index);
                    updateSlide();
                });
            });
        }
    }

    function updateSlide() {
        const content = document.getElementById('slide-content');
        const dots = document.querySelectorAll('.gallery-dot');

        if (!content) return;

        // Pause any playing video before switching
        const prevVideo = content.querySelector('video');
        if (prevVideo) prevVideo.pause();

        if (slideType === 'image') {
            content.innerHTML = `
                <img src="${slides[currentSlide]}" alt="Screenshot" style="
                    width:100%; height:100%; object-fit:contain; display:block;
                "/>`;
        } else if (slideType === 'video') {
            const src = slides[currentSlide].trim();
            if (src.startsWith('http')) {
                content.innerHTML = `<iframe src="${src}" style="width:100%;height:100%;border:none;" allowfullscreen></iframe>`;
            } else {
                content.innerHTML = `
                    <video controls autoplay style="width:100%;height:100%;display:block;">
                        <source src="${src}" type="video/mp4">
                        Your browser does not support video.
                    </video>`;
            }
        }

        dots.forEach((dot, i) => {
            dot.style.background = i === currentSlide ? '#fc6600' : 'rgba(255,255,255,0.35)';
        });
    }

    function openModal(card) {
        const title = card.dataset.title || '';
        const tag = card.dataset.tag || '';
        const desc = card.dataset.desc || '';
        const chips = card.dataset.chips ? card.dataset.chips.split(',') : [];
        const videos = card.dataset.video ? card.dataset.video.split(',').map(v => v.trim()).filter(Boolean) : [];
        const images = card.dataset.images ? card.dataset.images.split(',').map(v => v.trim()).filter(Boolean) : [];

        modalTag.textContent = tag;
        modalTitle.textContent = title;
        modalDesc.textContent = desc;

        const chipClasses = {
            'HTML': 'chip-html',
            'CSS': 'chip-css',
            'JavaScript': 'chip-js',
            'Angular': 'chip-angular',
            'React': 'chip-react',
            'Python': 'chip-py',
            'Django': 'chip-django',
            'PostgreSQL': 'chip-pg',
            'Figma': 'chip-fig',
            'GCP': 'chip-gcp',
            'React Native': 'chip-react',
            'TypeScript': 'chip-ts',
            'Android Studio': 'chip-as',
            'Java': 'chip-java',
            'AWS': 'chip-aws'
        };

        modalChips.style.display = 'flex';
        modalChips.style.flexWrap = 'wrap';
        modalChips.style.gap = '1rem';
        modalChips.style.marginTop = '0.5rem';
        modalTitle.style.color = '#fc6600';

        modalChips.innerHTML = chips.map(c => {
            const name = c.trim();
            const cls = chipClasses[name] || '';
            return `<span class="chip ${cls}">${name}</span>`;
        }).join('');

        // Media — images take priority, then videos
        if (images.length > 0) {
            buildSlideshow(images, 'image');
        } else if (videos.length > 0) {
            buildSlideshow(videos, 'video');
        } else {
            modalVideo.innerHTML = `<div style="
                width:100%; aspect-ratio:16/9;
                background:linear-gradient(135deg,#1a1a1a,#222);
                display:flex; align-items:center; justify-content:center;
                font-size:3rem; border-radius:16px 16px 0 0;
            ">🎬</div>`;
        }

        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
        const video = modalVideo.querySelector('video');
        if (video) video.pause();
        modalVideo.innerHTML = '';
        slides = [];
        currentSlide = 0;
        slideType = '';
    }

    document.querySelectorAll('.project-card, .card-wide').forEach(card => {
        card.addEventListener('click', () => openModal(card));
    });

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
        if (slides.length > 1) {
            if (e.key === 'ArrowRight') { currentSlide = (currentSlide + 1) % slides.length; updateSlide(); }
            if (e.key === 'ArrowLeft') { currentSlide = (currentSlide - 1 + slides.length) % slides.length; updateSlide(); }
        }
    });

    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = '#fc6600';
        closeBtn.style.color = '#111';
    });

    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'transparent';
        closeBtn.style.color = '#fc6600';
    });

});