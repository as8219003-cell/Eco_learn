function n(e) {
    this.init(e || {});
}

n.prototype = {
    init: function (e) {
        this.phase = e.phase || 0;
        this.offset = e.offset || 0;
        this.frequency = e.frequency || 0.001;
        this.amplitude = e.amplitude || 1;
    },
    update: function () {
        return (
            (this.phase += this.frequency),
            (e = this.offset + Math.sin(this.phase) * this.amplitude)
        );
    },
    value: function () {
        return e;
    },
};

function Line(e) {
    this.init(e || {});
}

Line.prototype = {
    init: function (e) {
        this.spring = e.spring + 0.1 * Math.random() - 0.02;
        this.friction = E.friction + 0.01 * Math.random() - 0.002;
        this.nodes = [];
        for (var t, n = 0; n < E.size; n++) {
            t = new Node();
            t.x = pos.x;
            t.y = pos.y;
            this.nodes.push(t);
        }
    },
    update: function () {
        var e = this.spring,
            t = this.nodes[0];
        t.vx += (pos.x - t.x) * e;
        t.vy += (pos.y - t.y) * e;
        for (var n, i = 0, a = this.nodes.length; i < a; i++)
            (t = this.nodes[i]),
            0 < i &&
            ((n = this.nodes[i - 1]),
                (t.vx += (n.x - t.x) * e),
                (t.vy += (n.y - t.y) * e),
                (t.vx += n.vx * E.dampening),
                (t.vy += n.vy * E.dampening)),
            (t.vx *= this.friction),
            (t.vy *= this.friction),
            (t.x += t.vx),
            (t.y += t.vy),
            (e *= E.tension);
    },
    draw: function () {
        var e,
            t,
            n = this.nodes[0].x,
            i = this.nodes[0].y;
        ctx.beginPath();
        ctx.moveTo(n, i);
        for (var a = 1, o = this.nodes.length - 2; a < o; a++) {
            e = this.nodes[a];
            t = this.nodes[a + 1];
            n = 0.5 * (e.x + t.x);
            i = 0.5 * (e.y + t.y);
            ctx.quadraticCurveTo(e.x, e.y, n, i);
        }
        e = this.nodes[a];
        t = this.nodes[a + 1];
        ctx.quadraticCurveTo(e.x, e.y, t.x, t.y);
        ctx.stroke();
        ctx.closePath();
    },
};

function onMousemove(e) {
    function o() {
        lines = [];
        for (var e = 0; e < E.trails; e++)
            lines.push(new Line({ spring: 0.4 + (e / E.trails) * 0.025 }));
    }

    function c(e) {
        e.touches
            ? ((pos.x = e.touches[0].pageX), (pos.y = e.touches[0].pageY))
            : ((pos.x = e.clientX), (pos.y = e.clientY)),
            e.preventDefault();
    }

    function l(e) {
        1 == e.touches.length &&
        ((pos.x = e.touches[0].pageX), (pos.y = e.touches[0].pageY));
    }

    document.removeEventListener('mousemove', onMousemove),
    document.removeEventListener('touchstart', onMousemove),
    document.addEventListener('mousemove', c),
    document.addEventListener('touchmove', c),
    document.addEventListener('touchstart', l),
    c(e),
    o(),
    render();
}

function render() {
    if (ctx.running) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.globalCompositeOperation = 'lighter';
        // Changed color to match eco theme - green/blue gradient
        ctx.strokeStyle = 'hsla(' + Math.round(f.update()) + ',70%,50%,0.6)';
        ctx.lineWidth = 2;
        for (var e, t = 0; t < E.trails; t++) {
            (e = lines[t]).update();
            e.draw();
        }
        ctx.frame++;
        window.requestAnimationFrame(render);
    }
}

function resizeCanvas() {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
}

var ctx,
    f,
    e = 0,
    pos = {},
    lines = [],
    E = {
        debug: false,
        friction: 0.5,
        trails: 15, // Reduced for better performance
        size: 40,   // Reduced for better performance
        dampening: 0.25,
        tension: 0.98,
    };

function Node() {
    this.x = 0;
    this.y = 0;
    this.vy = 0;
    this.vx = 0;
}

const renderCanvas = function () {
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'cursor-trail-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1';
    document.body.appendChild(canvas);
    
    ctx = canvas.getContext('2d');
    ctx.running = true;
    ctx.frame = 1;
    f = new n({
        phase: Math.random() * 2 * Math.PI,
        amplitude: 120, // Increased for more color variation
        frequency: 0.002, // Slightly faster color change
        offset: 180, // Starting with green-blue range
    });
    
    document.addEventListener('mousemove', onMousemove);
    document.addEventListener('touchstart', onMousemove);
    document.body.addEventListener('orientationchange', resizeCanvas);
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('focus', () => {
        if (!ctx.running) {
            ctx.running = true;
            render();
        }
    });
    window.addEventListener('blur', () => {
        ctx.running = false; // Stop when window loses focus for performance
    });
    resizeCanvas();
};

// Add toggle functionality
let trailEnabled = true;

function toggleCursorTrail() {
    trailEnabled = !trailEnabled;
    const canvas = document.getElementById('cursor-trail-canvas');
    if (canvas) {
        canvas.style.display = trailEnabled ? 'block' : 'none';
        if (ctx) {
            ctx.running = trailEnabled;
            if (trailEnabled) {
                render();
            }
        }
    }
    
    // Update toggle button text
    const toggleBtn = document.getElementById('cursor-trail-toggle');
    if (toggleBtn) {
        toggleBtn.innerHTML = trailEnabled 
            ? '<i class="fas fa-eye-slash"></i> Hide Trail' 
            : '<i class="fas fa-eye"></i> Show Trail';
    }
}

// Create toggle button
function createToggleButton() {
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'cursor-trail-toggle';
    toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Trail';
    toggleBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        background: rgba(76, 175, 80, 0.9);
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 25px;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 500;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 5px;
    `;
    
    toggleBtn.addEventListener('mouseenter', () => {
        toggleBtn.style.background = 'rgba(76, 175, 80, 1)';
        toggleBtn.style.transform = 'translateY(-2px)';
    });
    
    toggleBtn.addEventListener('mouseleave', () => {
        toggleBtn.style.background = 'rgba(76, 175, 80, 0.9)';
        toggleBtn.style.transform = 'translateY(0)';
    });
    
    toggleBtn.addEventListener('click', toggleCursorTrail);
    document.body.appendChild(toggleBtn);
}

// Initialize cursor trail when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        renderCanvas();
        createToggleButton();
    });
} else {
    renderCanvas();
    createToggleButton();
}
