// ========================================
// 学ナビLP - メインJavaScript
// ========================================

// ========================================
// ローディング画面
// ========================================
window.addEventListener('load', () => {
    const loading = document.getElementById('loading');
    setTimeout(() => {
        loading.classList.add('hidden');
    }, 500);
});

// ========================================
// PDF.js サムネイル生成
// ========================================
async function renderPDFThumbnail(canvas, pdfUrl) {
    try {
        const loadingEl = canvas.parentElement.querySelector('.pdf-loading');
        loadingEl.style.display = 'block';
        
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        const page = await pdf.getPage(1);
        
        const viewport = page.getViewport({ scale: 1.5 });
        const context = canvas.getContext('2d');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        loadingEl.style.display = 'none';
        canvas.style.display = 'block';
        
        console.log('✅ PDFサムネイル生成成功:', pdfUrl);
    } catch (error) {
        console.error('❌ PDFサムネイル生成エラー:', pdfUrl, error);
        const loadingEl = canvas.parentElement.querySelector('.pdf-loading');
        loadingEl.innerHTML = '<p style="color: #FF8A65;">読み込みエラー</p>';
    }
}

// すべてのPDFサムネイルを生成
document.addEventListener('DOMContentLoaded', () => {
    const thumbnails = document.querySelectorAll('.pdf-thumbnail');
    thumbnails.forEach(canvas => {
        const pdfUrl = canvas.dataset.pdfUrl;
        if (pdfUrl) {
            renderPDFThumbnail(canvas, pdfUrl);
        }
    });
});

// ========================================
// Swiper初期化（スマホ想定: ゆっくり・エンドレス・左→右に流す）
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    const swiper = new Swiper('.pdf-swiper', {
        slidesPerView: 1.15,
        spaceBetween: 16,
        centeredSlides: true,
        loop: true,
        loopAdditionalSlides: 2,
        grabCursor: true,
        speed: 5500,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
            reverseDirection: true,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            768: {
                slidesPerView: 2,
                spaceBetween: 24,
                speed: 5000,
            },
            1024: {
                slidesPerView: 2.5,
                spaceBetween: 32,
                speed: 5000,
            }
        }
    });
    
    console.log('✅ Swiper初期化成功（エンドレス・左→右）');
});

// ========================================
// PDFモーダル制御
// ========================================
const pdfModal = document.getElementById('pdfModal');
const pdfModalFrame = document.getElementById('pdfModalFrame');
const pdfModalTitle = document.getElementById('pdfModalTitle');
const pdfModalClose = document.querySelector('.pdf-modal-close');
const pdfModalBackground = document.querySelector('.pdf-modal-background');

// PDFカードクリック
document.addEventListener('click', (e) => {
    const pdfCard = e.target.closest('.pdf-card');
    if (pdfCard) {
        const pdfUrl = pdfCard.dataset.pdfUrl;
        const title = pdfCard.dataset.title;
        
        if (pdfUrl) {
            openPDFModal(pdfUrl, title);
        }
    }
});

// モーダルを開く
function openPDFModal(pdfUrl, title) {
    pdfModalFrame.src = pdfUrl;
    pdfModalTitle.textContent = title || 'イベント詳細';
    pdfModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    console.log('✅ PDFモーダル表示:', title);
}

// モーダルを閉じる
function closePDFModal() {
    pdfModal.classList.remove('active');
    pdfModalFrame.src = '';
    document.body.style.overflow = '';
    
    console.log('✅ PDFモーダル閉じる');
}

// 閉じるボタン
if (pdfModalClose) {
    pdfModalClose.addEventListener('click', closePDFModal);
}

// 背景クリック
if (pdfModalBackground) {
    pdfModalBackground.addEventListener('click', closePDFModal);
}

// ESCキー
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && pdfModal.classList.contains('active')) {
        closePDFModal();
    }
});

// ========================================
// スムーススクロール
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            console.log('✅ スムーススクロール:', targetId);
        }
    });
});

// ========================================
// 固定CTAボタン（SP用）
// ========================================
const fixedCta = document.getElementById('fixedCta');
const contactSection = document.getElementById('contact');

window.addEventListener('scroll', () => {
    if (window.innerWidth <= 768) {
        const contactPosition = contactSection.offsetTop;
        const scrollPosition = window.scrollY + window.innerHeight;
        
        if (scrollPosition < contactPosition) {
            fixedCta.classList.add('active');
        } else {
            fixedCta.classList.remove('active');
        }
    }
});

// ========================================
// フォームバリデーション＆送信
// ========================================
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // バリデーション
        if (!validateForm()) {
            return;
        }
        
        // フォームデータ取得
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            grade: formData.get('grade'),
            events: formData.getAll('event'),
            message: formData.get('message') || ''
        };
        
        console.log('📧 フォーム送信データ:', data);
        
        // 送信処理（実際のAPI連携はここで実装）
        try {
            // ここに実際の送信ロジックを追加
            // await fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) });
            
            // 成功表示
            contactForm.style.display = 'none';
            formSuccess.style.display = 'block';
            
            // スクロール
            formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            console.log('✅ フォーム送信成功');
        } catch (error) {
            console.error('❌ フォーム送信エラー:', error);
            alert('送信中にエラーが発生しました。もう一度お試しください。');
        }
    });
}

// フォームバリデーション
function validateForm() {
    let isValid = true;
    
    // 名前
    const nameInput = document.getElementById('name');
    if (!nameInput.value.trim()) {
        showError(nameInput, 'お名前を入力してください');
        isValid = false;
    } else {
        clearError(nameInput);
    }
    
    // メールアドレス
    const emailInput = document.getElementById('email');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim()) {
        showError(emailInput, 'メールアドレスを入力してください');
        isValid = false;
    } else if (!emailPattern.test(emailInput.value)) {
        showError(emailInput, '正しいメールアドレスを入力してください');
        isValid = false;
    } else {
        clearError(emailInput);
    }
    
    // 学年
    const gradeSelect = document.getElementById('grade');
    if (!gradeSelect.value) {
        showError(gradeSelect, '学年を選択してください');
        isValid = false;
    } else {
        clearError(gradeSelect);
    }
    
    // 希望イベント
    const eventCheckboxes = document.querySelectorAll('input[name="event"]:checked');
    const checkboxGroup = document.querySelector('.checkbox-group');
    if (eventCheckboxes.length === 0) {
        showError(checkboxGroup, '希望イベントを1つ以上選択してください');
        isValid = false;
    } else {
        clearError(checkboxGroup);
    }
    
    return isValid;
}

// エラー表示
function showError(element, message) {
    const formGroup = element.closest('.form-group');
    const errorMessage = formGroup.querySelector('.error-message');
    
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
    
    element.style.borderColor = '#FF8A65';
}

// エラークリア
function clearError(element) {
    const formGroup = element.closest('.form-group');
    const errorMessage = formGroup.querySelector('.error-message');
    
    if (errorMessage) {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
    }
    
    element.style.borderColor = '#63D1C6';
}

// リアルタイムバリデーション
document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const gradeSelect = document.getElementById('grade');
    
    if (nameInput) {
        nameInput.addEventListener('blur', () => {
            if (!nameInput.value.trim()) {
                showError(nameInput, 'お名前を入力してください');
            } else {
                clearError(nameInput);
            }
        });
    }
    
    if (emailInput) {
        emailInput.addEventListener('blur', () => {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailInput.value.trim()) {
                showError(emailInput, 'メールアドレスを入力してください');
            } else if (!emailPattern.test(emailInput.value)) {
                showError(emailInput, '正しいメールアドレスを入力してください');
            } else {
                clearError(emailInput);
            }
        });
    }
    
    if (gradeSelect) {
        gradeSelect.addEventListener('change', () => {
            if (!gradeSelect.value) {
                showError(gradeSelect, '学年を選択してください');
            } else {
                clearError(gradeSelect);
            }
        });
    }
});

// ========================================
// スクロールアニメーション
// ========================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('section');
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
});

// ========================================
// コンソールログ（動作確認）
// ========================================
console.log('🚀 学ナビLP - JavaScript読み込み完了');
console.log('📋 機能リスト:');
console.log('  ✅ ローディング画面');
console.log('  ✅ PDF.jsサムネイル生成');
console.log('  ✅ Swiper横スライド（autoplay: 3秒）');
console.log('  ✅ PDFモーダル表示');
console.log('  ✅ スムーススクロール');
console.log('  ✅ 固定CTAボタン（SP）');
console.log('  ✅ フォームバリデーション');
console.log('  ✅ スクロールアニメーション');