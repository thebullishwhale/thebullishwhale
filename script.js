function setupOverlayScrollbar() {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    document.body.style.width = '100vw';
    document.body.style.overflowX = 'hidden';
    
    if (scrollbarWidth > 0) {
        document.body.style.marginRight = `-${scrollbarWidth}px`;
    } else {
        document.body.style.marginRight = '0';
    }
    
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.style.width = '100vw';
        if (scrollbarWidth > 0) {
            navbar.style.marginRight = `-${scrollbarWidth}px`;
        } else {
            navbar.style.marginRight = '0';
        }
    }
    
    const style = document.createElement('style');
    style.id = 'scrollbar-no-arrows';
    style.textContent = `
        *::-webkit-scrollbar-button,
        *::-webkit-scrollbar-button:start:decrement,
        *::-webkit-scrollbar-button:end:increment,
        *::-webkit-scrollbar-button:vertical:start:decrement,
        *::-webkit-scrollbar-button:vertical:end:increment,
        *::-webkit-scrollbar-button:horizontal:start:decrement,
        *::-webkit-scrollbar-button:horizontal:end:increment {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
            min-width: 0 !important;
            min-height: 0 !important;
            max-width: 0 !important;
            max-height: 0 !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
            -webkit-appearance: none !important;
            appearance: none !important;
            pointer-events: none !important;
        }
    `;
    if (!document.getElementById('scrollbar-no-arrows')) {
        document.head.appendChild(style);
    }
    
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        const firefoxStyle = document.createElement('style');
        firefoxStyle.id = 'firefox-custom-scrollbar';
        firefoxStyle.textContent = `
            html {
                scrollbar-width: none !important;
            }
            body {
                scrollbar-width: none !important;
            }
            * {
                scrollbar-width: none !important;
            }
        `;
        if (!document.getElementById('firefox-custom-scrollbar')) {
            document.head.appendChild(firefoxStyle);
        }
        
    }
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

const logo = document.querySelector('.logo');
if (logo) {
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

const CONTRACT_ADDRESS = '6gH5aqXWb3nmDvYvFRCQv9L3eBhr9jhVN911cCxCpump';


async function fetchTokenData() {
    try {
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${CONTRACT_ADDRESS}`);
        const data = await response.json();
        
        if (data.pairs && data.pairs.length > 0) {
            const pair = data.pairs[0];
            
            const marketCapElement = document.getElementById('marketCap');
            let marketCap = null;
            if (marketCapElement && pair.fdv) {
                marketCap = parseFloat(pair.fdv);
                marketCapElement.textContent = formatNumber(marketCap);
            } else if (marketCapElement) {
                marketCapElement.textContent = 'Error';
            }
            
            const priceElement = document.getElementById('price');
            if (priceElement) {
                if (pair.priceUsd) {
                    const price = parseFloat(pair.priceUsd);
                    priceElement.textContent = '$' + price.toFixed(8);
                } else if (marketCap) {
                    const totalSupply = 1000000000;
                    const calculatedPrice = marketCap / totalSupply;
                    priceElement.textContent = '$' + calculatedPrice.toFixed(8);
                } else {
                    priceElement.textContent = 'Error';
                }
            }
            
        }
    } catch (error) {
        console.error('Error fetching token data:', error);
        updateStatsWithDefaults();
    }
}

function updateStatsWithDefaults() {
    const priceElement = document.getElementById('price');
    const marketCapElement = document.getElementById('marketCap');
    
    if (priceElement) priceElement.textContent = 'Error';
    if (marketCapElement) marketCapElement.textContent = 'Error';
}

function animateCounter(element, target, duration = 2000, isPrice = false) {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            if (isPrice) {
                element.textContent = '$' + target.toFixed(6);
            } else {
                element.textContent = formatNumber(target);
            }
            clearInterval(timer);
        } else {
            if (isPrice) {
                element.textContent = '$' + start.toFixed(6);
            } else {
                element.textContent = formatNumber(Math.floor(start));
            }
        }
    }, 16);
}

function formatNumber(num, includeDollar = true) {
    if (num >= 1000000) {
        return (includeDollar ? '$' : '') + (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (includeDollar ? '$' : '') + (num / 1000).toFixed(2) + 'K';
    }
    return (includeDollar ? '$' : '') + num.toFixed(2);
}

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            
            if (entry.target.classList.contains('stats')) {
                fetchTokenData();
            }
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(section);
});

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        navbar.style.background = 'rgba(0, 0, 0, 0.95)';
    } else {
        navbar.style.background = 'rgba(0, 0, 0, 0.8)';
    }
});

document.getElementById('buyBtn').addEventListener('click', () => {
    window.open('https://jup.ag/swap?sell=So11111111111111111111111111111111111111112&buy=6gH5aqXWb3nmDvYvFRCQv9L3eBhr9jhVN911cCxCpump', '_blank');
});

document.getElementById('chartBtn').addEventListener('click', () => {
    window.open('https://dexscreener.com/solana/6gH5aqXWb3nmDvYvFRCQv9L3eBhr9jhVN911cCxCpump', '_blank');
});

document.getElementById('copyBtn').addEventListener('click', () => {
    const contractAddress = document.getElementById('contractAddress').textContent.trim();
    navigator.clipboard.writeText(contractAddress).then(() => {
        const btn = document.getElementById('copyBtn');
        const originalText = btn.textContent;
        btn.textContent = 'COPIED!';
        btn.style.background = 'var(--primary-green)';
        btn.style.color = 'var(--dark-bg)';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = 'transparent';
            btn.style.color = 'var(--primary-green)';
        }, 2000);
    }).catch(() => {
        alert('Failed to copy address. Please copy manually: ' + contractAddress);
    });
});

function startDataUpdates() {
    fetchTokenData();
    
    setInterval(() => {
        fetchTokenData();
    }, 30000);
}

window.addEventListener('load', () => {
    setTimeout(startDataUpdates, 1000);
});

function createBackgroundText() {
    const backgroundText = document.querySelector('.background-text');
    if (!backgroundText) return;
    
    if (window.backgroundAnimationId) {
        cancelAnimationFrame(window.backgroundAnimationId);
        window.backgroundAnimationId = null;
    }
    
    backgroundText.innerHTML = '';
    
    const viewportWidth = window.innerWidth;
    const navbar = document.querySelector('.navbar');
    const navbarHeight = navbar ? navbar.offsetHeight : (viewportWidth <= 479 ? 60 : viewportWidth <= 767 ? 70 : 90);
    const footer = document.querySelector('.footer');
    const footerHeight = footer ? footer.offsetHeight : 0;
    const viewportHeight = window.innerHeight;
    const documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, viewportHeight);
    const paddingOffset = viewportWidth >= 768 ? 30 : 20;
    const bottomPaddingOffset = viewportWidth >= 768 ? 30 : 20;
    
    const containerHeight = documentHeight - navbarHeight - footerHeight - paddingOffset - bottomPaddingOffset;
    
    backgroundText.style.position = 'fixed';
    backgroundText.style.top = `${navbarHeight + paddingOffset}px`;
    backgroundText.style.left = '0';
    backgroundText.style.right = '0';
    backgroundText.style.width = '100%';
    backgroundText.style.height = `${containerHeight}px`;
    backgroundText.style.maxHeight = `${containerHeight}px`;
    backgroundText.style.overflow = 'hidden';
    backgroundText.style.clipPath = 'none';
    
    let fontSize;
    if (viewportWidth >= 1440) {
        fontSize = '120px';
    } else if (viewportWidth >= 1024) {
        fontSize = '120px';
    } else if (viewportWidth >= 768) {
        fontSize = '90px';
    } else if (viewportWidth >= 480) {
        fontSize = '60px';
    } else {
        fontSize = '50px';
    }
    
    const tempSpan = document.createElement('span');
    tempSpan.textContent = '$BULLWHALE';
    tempSpan.style.fontSize = fontSize;
    tempSpan.style.fontWeight = '900';
    tempSpan.style.fontFamily = 'Space Grotesk, Inter, Arial Black, Arial, sans-serif';
    tempSpan.style.position = 'absolute';
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.whiteSpace = 'nowrap';
    tempSpan.style.lineHeight = '1.2';
    document.body.appendChild(tempSpan);
    
    const elementWidth = tempSpan.offsetWidth;
    const elementHeight = tempSpan.offsetHeight;
    
    document.body.removeChild(tempSpan);
    
    const paddingMultiplier = viewportWidth >= 768 ? 1 : 0.6;
    const horizontalSpacing = elementWidth + (50 * paddingMultiplier);
    const verticalSpacing = elementHeight + (30 * paddingMultiplier);
    
    const animationDistance = horizontalSpacing;
 
    document.documentElement.style.setProperty('--animation-distance', `${animationDistance}px`);
    
    const viewportCols = Math.ceil(viewportWidth / horizontalSpacing);
    
    const animationCols = Math.ceil(animationDistance / horizontalSpacing) || 1;

    const bufferCols = viewportWidth >= 768 ? 3 : 2;
    const cols = viewportCols + (animationCols * 2) + (bufferCols * 2);
    
    const maxContentHeight = containerHeight;
    const rowBuffer = 0;
    const maxRows = Math.ceil(maxContentHeight / verticalSpacing) + 2;
    const rows = Math.max(1, maxRows);
    
    const startOffset = -(animationCols + bufferCols) * horizontalSpacing;
    
    const animatedElements = [];
    
    const contentAreaHeight = containerHeight;
    const absoluteBottom = containerHeight - bottomPaddingOffset;
    
    for (let row = 0; row < rows; row++) {
        const rowDirection = row % 2 === 0 ? 'right' : 'left';
        const topPosition = row * verticalSpacing;
        const bottomPosition = topPosition + elementHeight;
        
        if (bottomPosition > absoluteBottom) {
            break;
        }
        
        if (topPosition < 0 || topPosition >= absoluteBottom) {
            continue;
        }
        
        for (let col = 0; col < cols; col++) {
            const span = document.createElement('span');
            span.textContent = '$BULLWHALE';
            span.style.fontSize = fontSize;
            const left = startOffset + col * horizontalSpacing;
            
            span.style.left = `${left}px`;
            span.style.top = `${topPosition}px`;
            const remainingHeight = absoluteBottom - topPosition;
            if (remainingHeight > 0 && remainingHeight < elementHeight) {
                span.style.maxHeight = `${remainingHeight}px`;
                span.style.overflow = 'hidden';
            }
            
            span.style.willChange = 'transform';
            span.style.backfaceVisibility = 'hidden';
            span.style.transformStyle = 'preserve-3d';
            span.style.pointerEvents = 'none';
            if (viewportWidth < 768) {
                span.style.transform = 'translateZ(0)';
            }
            animatedElements.push({
                element: span,
                initialLeft: left,
                direction: rowDirection === 'right' ? 1 : -1,
                speed: 0.5
            });
            
            backgroundText.appendChild(span);
        }
    }
    
    let animationFrameId;
    let animationOffset = 0;
    const animationSpeed = viewportWidth >= 768 ? 0.3 : 0.2;
    
    function animateBackground() {
        animationOffset += animationSpeed;
        
        if (animationOffset >= animationDistance) {
            animationOffset = 0;
        }
        
        animatedElements.forEach(item => {
            const translateX = animationOffset * item.direction;
            item.element.style.transform = `translateX(${translateX}px)`;
        });
        
        animationFrameId = requestAnimationFrame(animateBackground);
    }
    
    animateBackground();
    window.backgroundAnimationId = animationFrameId;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

let isCreatingBackground = false;

window.addEventListener('load', () => {
    if (!isCreatingBackground) {
        isCreatingBackground = true;
        setTimeout(() => {
            createBackgroundText();
            isCreatingBackground = false;
        }, 100);
    }
});
window.addEventListener('resize', debounce(() => {
    if (!isCreatingBackground) {
        isCreatingBackground = true;
        createBackgroundText();
        setTimeout(() => {
            isCreatingBackground = false;
        }, 500);
    }
}, 300));

window.addEventListener('scroll', debounce(() => {
    const backgroundText = document.querySelector('.background-text');
    if (backgroundText) {
        const viewportWidth = window.innerWidth;
        const navbar = document.querySelector('.navbar');
        const navbarHeight = navbar ? navbar.offsetHeight : (viewportWidth <= 479 ? 60 : viewportWidth <= 767 ? 70 : 90);
        const footer = document.querySelector('.footer');
        const footerHeight = footer ? footer.offsetHeight : 0;
        const viewportHeight = window.innerHeight;
        const documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, viewportHeight);
        const paddingOffset = viewportWidth >= 768 ? 30 : 20;
        const bottomPaddingOffset = viewportWidth >= 768 ? 30 : 20;
        const containerHeight = documentHeight - navbarHeight - footerHeight - paddingOffset - bottomPaddingOffset;
        backgroundText.style.top = `${navbarHeight + paddingOffset}px`;
        backgroundText.style.height = `${containerHeight}px`;
        backgroundText.style.maxHeight = `${containerHeight}px`;
        backgroundText.style.overflow = 'hidden';
        backgroundText.style.clipPath = 'none';
    }
}, 100));

setupOverlayScrollbar();

window.scrollTo(0, 0);
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

document.documentElement.classList.add('loading');
document.body.classList.add('loading');

window.addEventListener('load', () => {
    window.scrollTo(0, 0);
    
    const loader = document.getElementById('loader');
    const loaderAnimation = loader?.querySelector('.loader-animation');
    
    if (loader && loaderAnimation) {
        setTimeout(() => {
            loaderAnimation.classList.add('hidden');
            
            setTimeout(() => {
                loader.classList.add('hidden');
                setTimeout(() => {
                    document.documentElement.classList.remove('loading');
                    document.body.classList.remove('loading');
                    loader.remove();
                    window.scrollTo(0, 0);
                    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                        if (typeof createFirefoxCustomScrollbar === 'function') {
                            createFirefoxCustomScrollbar();
                        }
                    }
                }, 500);
            }, 300);
        }, 500);
    }
});

function createFirefoxCustomScrollbar() {
    const existing = document.getElementById('custom-scrollbar');
    if (existing) existing.remove();
    
    const darkerBg = '#050505';
    const primaryGreen = '#00ff88';
    const lightGreen = '#33ffaa';
    
    const scrollbarContainer = document.createElement('div');
    scrollbarContainer.id = 'custom-scrollbar';
    scrollbarContainer.style.cssText = `
        position: fixed;
        right: 0;
        top: 0;
        width: 12px;
        height: 100vh;
        background: transparent;
        z-index: 999999;
        pointer-events: none;
        overflow: visible;
    `;
    
    const scrollbarThumb = document.createElement('div');
    scrollbarThumb.id = 'custom-scrollbar-thumb';
    scrollbarThumb.style.cssText = `
        position: absolute;
        right: 2px;
        width: 8px;
        background: ${primaryGreen};
        border-radius: 0;
        border: 2px solid ${darkerBg};
        pointer-events: auto;
        cursor: default;
        transition: none;
        z-index: 999999;
    `;
    
    scrollbarContainer.appendChild(scrollbarThumb);
    document.body.appendChild(scrollbarContainer);
    
    function updateScrollbar() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (documentHeight <= windowHeight) {
            scrollbarContainer.style.display = 'none';
            return;
        }
        
        scrollbarContainer.style.display = 'block';
        const thumbHeight = (windowHeight / documentHeight) * windowHeight;
        const maxTop = windowHeight - thumbHeight;
        const thumbTop = (scrollTop / (documentHeight - windowHeight)) * maxTop;
        
        scrollbarThumb.style.height = `${Math.max(30, thumbHeight)}px`;
        scrollbarThumb.style.top = `${Math.max(0, Math.min(maxTop, thumbTop))}px`;
    }
    
    let isDragging = false;
    let startY = 0;
    let startScrollTop = 0;
    
    scrollbarThumb.addEventListener('mousedown', (e) => {
        isDragging = true;
        startY = e.clientY;
        startScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        e.preventDefault();
        e.stopPropagation();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaY = e.clientY - startY;
        const documentHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        const maxScroll = documentHeight - windowHeight;
        const scrollRatio = deltaY / (windowHeight - (windowHeight / documentHeight) * windowHeight);
        const newScrollTop = startScrollTop + (scrollRatio * maxScroll);
        window.scrollTo({
            top: Math.max(0, Math.min(maxScroll, newScrollTop)),
            behavior: 'auto'
        });
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    window.addEventListener('scroll', updateScrollbar);
    window.addEventListener('resize', updateScrollbar);
    updateScrollbar();
}


console.log('%c🐋 THE BULLISH WHALE 🐋', 'color: #00ff88; font-size: 20px; font-weight: bold;');
