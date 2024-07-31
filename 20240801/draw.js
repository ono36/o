var canvas;
var ctx;

var imgData;
var buffer;
var bfData;
var strokes=[];
var anchors=[];
var ANCHOR_SIZE=8;
var BOLD = 2;
var INTERVAL = 4;
var i_count=0;

var selected_pos = -1;
canvas = document.getElementById("c");
var members=["bold","r","g","b"];
var inputs=[];
for(var i=0;i<members.length;i++){
	var member = members[i];
	inputs[member] = document.getElementById(member);
	inputs[member].addEventListener("change",(e)=>{
		if(selected_pos<0){return;}	
		var target = e.target;
		var anchor = anchors[selected_pos];
		anchor[target.id] = Number(e.target.value);
		loop();
	});
}
var offset=[];
press_key = 0;


function addStroke(){
	var stroke = {};
	stroke.anchors=[];
	strokes.push(stroke);
	return stroke;
}
function hitCheck(point){

	var lmin=11;
	var minpos=-1;
	for(var i=0;i<anchors.length;i++){
		var l = len(anchors[i].pos,point);
		if(l>ANCHOR_SIZE+2){
			continue;
		}
		if(lmin>l){
			lmin=l;
			minpos = i;
		}
	}
	return minpos;
}
function hitCheckLines(point){

	for(var i=0;i<strokes.length;i++){
		var anchors = strokes[i].anchors;
		for(var j=0;j<anchors.length;j++){
		}
	}
	return minpos;
}

canvas.addEventListener("pointerdown",(e)=>{

	i_count=0;

	selected_pos=-1;
	target=e.target;
	var num =target.id.replace("anchor","")
	var point = [];
	point[0]=e.offsetX;
	point[1]=e.offsetY;


	minpos = hitCheck(point);

	if(minpos<0){
		if(e.button===0){
			var stroke = addStroke();
			var anchor = addAnchor(point[0],point[1])
			stroke.anchors.push(anchor);
			press_key = 1;
		}
			selected_pos=-1;
	}else{
		if(e.button===1){
			//削除
	for(var i=0;i<strokes.length;i++){
		var l = strokes[i].anchors.indexOf(anchors[minpos])
		if(l>=0){
			strokes[i].anchors.splice(l,1);
			if(strokes[i].anchors.length<=0){
				strokes.splice(i,1);s
			}
			break;
		}
	}
			anchors.splice(minpos,1);

			selected_pos=-1;
		}else{
			var anchor = anchors[minpos];
			selected_pos = minpos;
for(var i=0;i<members.length;i++){
	var member = members[i];
			inputs[member].value = anchor[member];
}
			offset[0]=anchor.pos[0] - e.x;
			offset[1]=anchor.pos[1]- e.y;
			press_key = 1;
		}
	}
	loop();

	
});
function addAnchor(x,y){
			var anchor={pos:[],bold,r:0,g:0,b:0};

			anchor.pos[0]=x;
			anchor.pos[1]=y;
			anchor.bold =2;
	anchors.push(anchor);

	return anchor;



}
window.addEventListener("pointerup",(e)=>{
	press_key = 0;
});
window.addEventListener("pointermove",(e)=>{

	if(press_key == 0){return;}
	if(selected_pos<0){
		if(i_count <INTERVAL){
			i_count++;
			return;
		}
		i_count=0;
		var stroke = strokes[strokes.length-1];
		var anchor = addAnchor(e.x - canvas.offsetLeft,e.y - canvas.offsetTop)
		stroke.anchors.push(anchor);
	}else{
		var point = anchors[selected_pos].pos;
		point[0] = e.x + offset[0];
		point[1] = e.y + offset[1];
	}
	loop();
});

function drawRect(_x,_y,_w,_h){
	var x = Math.floor(Math.max(_x,0) );
	var y = Math.floor(Math.max(_y,0));
	var x2 = Math.min(Math.floor(_x+_w),buffer.width );
	var y2 = Math.min(Math.floor(_y+_h),buffer.height );
	for(var i=y;i<y2;i++){
		for(var j=x;j<x2;j+=Math.floor(_w-1)){
			var idx = j + i * buffer.width << 2;
			bfData[idx] = 128- bfData[idx];
			bfData[idx+1] = 128- bfData[idx+1];
			bfData[idx+2] = 128- bfData[idx+2];
			bfData[idx+3] = 255;
		}	
	}	
	for(var i=y;i<y2;i+=Math.floor(_h-1)){
		for(var j=x;j<x2;j++){
			var idx = j + i * buffer.width << 2;
			bfData[idx] = 128- bfData[idx];
			bfData[idx+1] = 128- bfData[idx+1];
			bfData[idx+2] = 128- bfData[idx+2];
			bfData[idx+3] = 255;
		}	
	}	

		
}

function drawLine(a0,a1){
	var p0 = a0.pos;
	var p1 = a1.pos;
	var b = Math.max(a0.bold,a1.bold);
	var x = Math.min(p0[0],p1[0])-b;
	var y = Math.min(p0[1],p1[1])-b;
	var x2 = Math.max(p0[0],p1[0])+b;
	var y2 = Math.max(p0[1],p1[1])+b;
	x = Math.floor(Math.max(x,0));
	y = Math.floor(Math.max(y,0));
	x2 = Math.floor(Math.min(x2,buffer.width));
	y2 = Math.floor(Math.min(y2,buffer.height));

	var nrm = [];
	var vec = [];
	sub(vec,p1,p0);
	nrm[0] = vec[1];
	nrm[1] = -vec[0];

	normalize(nrm);
	var l = 1/(vec[0]*vec[0]+vec[1]*vec[1]);
	vec[0]*=l;
	vec[1]*=l;

	var p =[];

	for(var i=y;i<y2;i++){
		for(var j=x;j<x2;j++){
			p[0]=j-p0[0];
			p[1]=i-p0[1];
			var r = dot(p,vec);

			var l2 = 0;

			if(r<0){
				p[0]=j;
				p[1]=i;
				l2 = len(p,p0);
				r = 0;
			}else if(r>1){
				p[0]=j;
				p[1]=i;
				l2 = len(p,p1);
				r=1;
			}else{	
				p[0]=j-p0[0];
				p[1]=i-p0[1];
			    l2 = dot(p,nrm);

			}
			bold = a0.bold * (1-r) + a1.bold * r;
			

			if(l2*l2>bold*bold){
				continue;
			}
			l2=Math.abs(l2);



			var red = a0.r * (1-r) + a1.r * r;
			var green= a0.g * (1-r) + a1.g * r;
			var blue= a0.b * (1-r) + a1.b * r;

			var idx = j + i * buffer.width << 2;
		
			var d = (bold-l2) ;
			d=Math.min(d,1);
			//red=red*(1-d)+d;
			//green=green*(1-d)+d;
			//blue=blue*(1-d)+d;

			bfData[idx] = red*255|0;
			bfData[idx+1] =  green*255|0;
			bfData[idx+2] =  blue*255|0;
			bfData[idx+3] =  Math.max(bfData[idx+3],d*255|0);
		}	
	}	
		
}
function calck(k,p0,p1,p2,p3){

	k.c = (p2-p0)*0.5;
	k.d = p1;

	k.a = (p3-p1)*0.5 -2*p2+k.c+2*p1;
	k.b = p2 -k.a-k.c-p1;


	return k;
}
function drawBetween(a0,a1,a2,a3){
	var delta0;
	var delta1;
	var k =[{},{}];
	var a=[];
	var b=[];
	var c=[];
	var d=[];
	

	calck(k[0],a0.pos[0],a1.pos[0],a2.pos[0],a3.pos[0])
	calck(k[1],a0.pos[1],a1.pos[1],a2.pos[1],a3.pos[1])
	for(var i=0;i<members.length;i++){
		var member = members[i];
		k[i+2]={};
		calck(k[i+2],a0[member],a1[member],a2[member],a3[member])
	};


	dummy0={pos:[0,0],bold:1}
	dummy0.pos[0]=a1.pos[0];
	dummy0.pos[1]=a1.pos[1];
	for(var i=0;i<members.length;i++){
		var member = members[i];
		dummy0[member]=a1[member];
	}

	dummy1={pos:[0,0],bold:1}

	var sep_num= (len(a1.pos,a2.pos)>>3)+1;
	var _sep_num = 1/sep_num;
	for(var i=0;i<sep_num;i++){
		var r = (i+1)*_sep_num;
		var r2 = r*r;
		var r3 = r*r*r;
		dummy1.pos[0]= r3 * k[0].a +  r2 * k[0].b + r * k[0].c + k[0].d;
		dummy1.pos[1]= r3 * k[1].a +  r2 * k[1].b + r * k[1].c + k[1].d;
		for(var j=0;j<members.length;j++){
			var member = members[j];

			dummy1[member]= r3 * k[2+j].a +  r2 * k[2+j].b + r * k[2+j].c + k[2+j].d;


		};

		
		drawLine(dummy0,dummy1);

		var buf = dummy0;
		dummy0 = dummy1;
		dummy1 = buf;
		
		
	}
}

function drawStroke(stroke){
	var anchors = stroke.anchors;
	for(var i=0;i<anchors.length-1;i++){
		drawBetween(
			 anchors[Math.max(i-1,0)]
			 ,anchors[i]
			 ,anchors[i+1]
			 ,anchors[Math.min(i+2,anchors.length-1)]
		)

	}

}
function drawpoints(){
	for(var i=0;i<strokes.length;i++){
		drawStroke(strokes[i])
	}

	for(var i=0;i<anchors.length;i++){
		var point = anchors[i].pos;
		drawRect(point[0]-(ANCHOR_SIZE>>1)
		,point[1]-(ANCHOR_SIZE>>1)
		,ANCHOR_SIZE,ANCHOR_SIZE);
	}
	if(selected_pos>=0){
		var point = anchors[selected_pos].pos;
		drawRect(point[0]-(ANCHOR_SIZE>>1)-2
		,point[1]-(ANCHOR_SIZE>>1)-2
		,ANCHOR_SIZE+4,ANCHOR_SIZE+4);
	}

}
function len(A,B){
	var x = A[0]-B[0];
	var y = A[1]-B[1];
	return Math.sqrt(x*x+y*y);
}
function len2(A,B){
	var x = A[0]-B[0];
	var y = A[1]-B[1];
	return x*x+y*y;
}
function scalar(A){
	return Math.sqrt(A[0]*A[0]+A[1]*A[1]);
}
function normalize(A){
	var l = 1/scalar(A);
	A[0]*=l;
	A[1]*=l;
}
function dot(A,B){
	return A[0]*B[0] + A[1]*B[1];
}
function add(A,B,C){
	A[0]=B[0]+C[0]
	A[1]=B[1]+C[1]
}
function sub(A,B,C){
	A[0]=B[0]-C[0]
	A[1]=B[1]-C[1]
}




function mix(r,v0,v1){
	return v0*(1-r) + v1*r;
}
function loop(){
	bfData.fill(0);
	
	drawpoints();
	ctx.putImageData(buffer,0,0);
	
}
window.onload=()=>{

	

	ctx = canvas.getContext("2d");



	buffer = ctx.createImageData(640,480);
	bfData = buffer.data;


	loop();
}


