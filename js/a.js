var canvas,
	ctx,
	width,
	height,
	xGravity,
	yGravity,
	friction,
	dots,
	palettes,
	paletteCount,
	paletteCurrent,
	colorCount,
	tick,
	mx,
	my,
	PI,
	TWOPI;

function rand( min, max ) {
	return Math.random() * ( max - min ) + min;
}

function randInt( min, max ) {
	return Math.floor( min + Math.random() * ( max - min + 1 ) );
};
// Thêm lớp hover khi người dùng hover vào phần tử

function Dot() {
	this.x = width / 2;
	this.y = height / 2;
	this.vx = rand( -2, 2 );
	this.vy = rand( -2, 2 );
	this.radius = rand( 5, 15 );
	this.color = randInt( 1, colorCount - 1 );
}

Dot.prototype.step = function( i ) {
	// apply forces	
	this.x += this.vx;
	this.y += this.vy;
		
	// handle bounce	
	if( this.vx > 0 && this.x + this.radius >= width ) {
		this.vx *= -0.6;
	}
	
	if( this.vx < 0 && this.x - this.radius <= 0 ) {
		this.vx *= -0.6;
	}
	
	if( this.vy > 0 && this.y + this.radius >= height ) {
		this.vy *= -0.6;
	}
	
	if( this.vy < 0 && this.y - this.radius <= 0 ) {
		this.vy *= -0.6;
	}
	
	// handle bounds and friction	
	if( this.x + this.radius > width ) {
		this.x = width - this.radius;
		this.vy *= friction;
	}
	
	if( this.x - this.radius < 0 ) {
		this.x = this.radius;
		this.vy *= friction;
	}
	
	if( this.y + this.radius > height ) {
		this.y = height - this.radius;
		this.vx *= friction;
	}
	
	if( this.y - this.radius < 0 ) {
		this.y = this.radius;
		this.vx *= friction;
	}
	
	// handle gravity	
	this.vx += xGravity;
	this.vy += yGravity;
};

Dot.prototype.collide = function( otherDot ) {
	// still working on understanding this
	// lots of help from https://lamberta.github.io/html5-animation/
	var dx = otherDot.x - this.x,
		dy = otherDot.y - this.y,
		dist = Math.sqrt( dx * dx + dy * dy ),
		minDist = this.radius + otherDot.radius;
	if( dist < minDist ) {
		var tx = this.x + dx / dist * minDist,
			ty = this.y + dy / dist * minDist,
			ax = ( tx - otherDot.x ) * 0.6,
			ay = ( ty - otherDot.y ) * 0.6;
		this.vx -= ax;
		this.vy -= ay;      
		otherDot.vx += ax;
		otherDot.vy += ay;
		this.vx *= friction * 0.9;
		this.vy *= friction * 0.9;
		otherDot.vx *= friction * 0.9;
		otherDot.vy *= friction * 0.9;
	}
};
Dot.prototype.draw = function() {
    const cx = this.x; // Tọa độ X của tâm ngôi sao
    const cy = this.y; // Tọa độ Y của tâm ngôi sao
    const outerRadius = this.radius; // Bán kính ngoài của ngôi sao
    const innerRadius = this.radius / 2; // Bán kính trong của ngôi sao

    const spikes = 5; // Số cánh của ngôi sao
    const step = Math.PI / spikes; // Bước góc giữa các đỉnh của ngôi sao

    ctx.beginPath();
    ctx.moveTo(cx + outerRadius * Math.cos(0), cy - outerRadius * Math.sin(0)); // Bắt đầu tại đỉnh đầu tiên

    for (let i = 0; i < spikes * 2; i++) {
        const angle = i * step; // Tính góc hiện tại
        const radius = (i % 2 === 0) ? outerRadius : innerRadius; // Chọn bán kính ngoài hoặc trong
        ctx.lineTo(cx + radius * Math.cos(angle), cy - radius * Math.sin(angle)); // Vẽ đường thẳng đến điểm tiếp theo
    }

    ctx.closePath(); // Đóng đường dẫn để hoàn thiện ngôi sao

    ctx.fillStyle = palettes[paletteCurrent][this.color];
    ctx.fill();
};

function init() {
	canvas = document.getElementById( 'canvas' );
	ctx = canvas.getContext( '2d' );
	xGravity = 0;
	yGravity = 1;
	friction = 0.99;
	dots = [];
	// palette credits:
	// https://color.adobe.com/Friends-and-foes-color-theme-1175537/
	// https://color.adobe.com/Ocean-Sunset-color-theme-46355/
	// https://color.adobe.com/Gettysburg-color-theme-209416/
	// https://color.adobe.com/vintage-card-color-theme-3165833/
	palettes = [
		[
			'#2e2932',
			'#01a2a6',
			'#37d8c2',
			'#bdf271',
			'#ffffa6'
		],
		[
			'#405952',
			'#9c9b7a',
			'#ffd393',
			'#ff974f',
			'#f35033'
		],
		[
			'#962d3e',
			'#343641',
			'#979c9c',
			'#f2ebc9',
			'#388898'
		],
		[
			'#f2ebbf',
			'#5c4b51',
			'#8dbeb2',
			'#f2b468',
			'#ee6163'
		]
	];
	paletteCount = palettes.length;
	paletteCurrent = 3;	
	colorCount = palettes[ 0 ].length;
	PI = Math.PI;
	TWOPI = PI * 2;
	
	reset();
	loop();
}

function reset() {
	width = window.innerWidth;
	height = window.innerHeight;
	dots.length = 0;
	tick = 0;
	mx = width / 2;
	my = height / 2;
	
	canvas.width = width;
	canvas.height = height;
}

function create() {
	if( tick && dots.length < 500 ) {
		dots.push( new Dot() );	
	}
}

function step() {
	var i = dots.length;
	while( i-- ) {
		dots[ i ].step( i );	
	}
	
	i = dots.length;
	while( i-- ) {
		dot = dots[ i ];
		var j = i;
		if( j > 0 ) {
			while( j-- ) {
				dot.collide( dots[ j ] );
			}
		}
	}
}

function draw() {
	ctx.fillStyle = palettes[ paletteCurrent ][ 0 ];
	ctx.fillRect( 0, 0, width, height );
	
	var i = dots.length;
	while( i-- ) {
		dots[ i ].draw();	
	}
}

function loop() {
	requestAnimationFrame( loop );
	create();
	step();
	draw();
	tick++;
}

function onmousemove( e ) {
	mx = e.pageX;
	my = e.pageY;
	
	xGravity = ( mx - width / 2 ) / ( width / 2 );
	yGravity = ( my - height / 2 ) / ( height / 2 );
}

function onmousedown() {
	var i = dots.length;
	while( i-- ) {
		dots[ i ].vx += rand( -10, 10 );
		dots[ i ].vy += rand( -10, 10 );
	}

	if( paletteCurrent < paletteCount - 1 ) {
		paletteCurrent++;	
	} else {
		paletteCurrent = 0;	
	}
}

window.addEventListener( 'resize', reset );
window.addEventListener( 'mousemove', onmousemove );
window.addEventListener( 'mousedown', onmousedown );

init();