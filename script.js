
//HTML script init
function runit(){  
    console.log("hello");

    zoom();
    runFileScroll(); // change name?
}
//

//Shortname element retrieval
function get(id){
    return document.getElementById(id);
}
//

var clicked;
var cx = 0, cy = 0;
var drawX = 0, drawY = 0;
var bndCanvas = [];
var drawCanvas = []; //All boundaries that are being drawn on
var clickId;
var drawing;
var del;


function canvasDraw(e){
    if(drawCanvas.indexOf(e.target.parentElement.id) > -1){
        drawX = e.clientX;
        drawY = e.clientY;
        drawing = true;
        console.log('drawing');
    }
}
function boundaryHover(e){
    //console.log("Hovering in "+e.target.id);

    if(del){
        b = get(e.target.id);
        b.remove();
        del = false;

    }
    if(clicked && drawCanvas.indexOf(e.target.parentElement.id)<0 && (e.target.id == clickId || e.target.parentElement.id == clickId)){
        var b = get(clickId);
        b.style.position ='absolute';
        b.style.zIndex = "1";
        b.style.left = e.x-(b.clientWidth/2)+'px';
        b.style.top = e.y-(b.clientHeight/2)+'px';
    }
    if(drawing && drawCanvas.indexOf(e.target.parentElement.id) > -1){
        console.log("drawww");
        var canvas = get('cnv'+e.target.parentElement.id);
        var context = canvas.getContext('2d');
        context.rect(drawX,drawY,1,1);
        //DRAWING
        // context.beginPath();
        // context.strokeStyle = '#123456';
        // context.lineWidth = 1
        // context.lineJoin = "round";
        // context.moveTo(drawX, drawY);
        // context.lineTo(e.clientX, e.clientY);
        // context.closePath();
        context.stroke();
 
        drawX = e.clientX;
        drawY = e.clientY;
    }
}
function boundaryClick(e){
    console.log(e);
    clickId = (e.target.id.startsWith('_f')) ? e.target.id : e.target.parentElement.id;
    if(clicked){
        clicked = false;
        var b = get(clickId);
        b.style.zIndex = "-1"; //when not moving a boundary, move it to the back
    }else{
        clicked = true;
    }
    if(e.button == 2){ //right click
        clicked = false;
        var b = get(clickId);
        if(bndCanvas.indexOf(clickId) < 0){ //Add canvas element to a boundary
            b.innerHTML += "<canvas id='cnv"+clickId+"' class='can'></canvas>";
            var cnv = get('cnv'+clickId);
            cnv.width = e.target.width;
            cnv.hieght = e.target.height;
            b.style.borderRadius = '10px';
            bndCanvas.push(clickId);
        }
        else{ //boundary already has a canvas
            if(drawCanvas.indexOf(clickId)>-1){ //Canvas is in draw mode, turn off draw mode
                drawCanvas.pop();
                var bndCnvText = get('i'+clickId)
                bndCnvText.remove();
            }else{ //Canvas not in draw mode, turn on draw mode
                b.innerHTML+="<i id='i"+clickId+"'>Drawing</i>";
                drawCanvas.push(clickId);
            }
        }
    }
}
function fileDrop(e, dragging){
    console.log(e);
    if(!dragging){
        id = e.target.id;
        
        e.stopPropagation();
        e.preventDefault();
         
        var items = e.dataTransfer.items;
        var files = e.dataTransfer.files;
        console.log(e);
        if(items){
            var boundary = get(id);
            boundary.children[0].src = e.dataTransfer.getData('text/x-moz-url-data');
            boundary.children[0].style.height = "100%";
            boundary.children[0].style.width = "100%";
            boundary.children[0].style.zIndex = "0";
        }
        
        else if(files){
            if(files[0].type.startsWith('image')){
                console.log(files[0]);
                var boundary = get(id);
                let reader = new FileReader()
                reader.readAsDataURL(files[0])
                reader.onloadend = function() {
                    boundary.children[0].src = reader.result;
                    boundary.children[0].style.height = "100%";
                    boundary.children[0].style.width = "100%";
                    boundary.children[0].style.zIndex = "0";
                }
            }
        }
        b = get(id);
        b.style.border = '';

        return false;
    }
}
//File Scroll
var fileRun;
var boundCnt = 0;
var boundaries = [];
function runFileScroll(e){

    if(e){
        del = true;
    }else{
        fileRun=true;
        board = get('board');
        board.innerHTML += "<div class='fz' id='_f"+boundCnt+"' style='width:10px; height:10px; border:solid 2px black;'><img id='_f"+boundCnt+"'/><p contenteditable='true' style='font-size:.1px;word-wrap:break-word;'>Text Here</p></div>";//
        boundaries.push("_f"+boundCnt);
        boundCnt++;
    }
}

//Zoom
var zooming = false;
w = 0;
function zoom(){
    function scr(e){
        if(fileRun){
            var scrollLocation = String(e.target.id);       
            if(scrollLocation.startsWith('_f')){
                fileBoundary = get(scrollLocation);
                if(boundaries.indexOf(scrollLocation) > -1){
                    bw = fileBoundary.style.width;
                    bw = parseInt(String(bw).replace('px',''));
                    (e.deltaY < 0) ? bw+=10 : bw-=10;
                    
                    fileBoundary.style.width = bw+'px';
                    fileBoundary.style.height = bw+'px';
                    text = fileBoundary.children[1];
                    text.style.fontSize = bw*.1+'px';
                    //console.log(text);
                }
            }
        }
    }
    window.addEventListener('wheel',scr);
}
//

window.addEventListener('mousedown', (e)=>canvasDraw(e));
window.addEventListener('mousemove',(e)=> {(e.target.id!='') ? boundaryHover(e) : ''}); 
document.addEventListener('dragover', (e)=> e.preventDefault(), false);
window.addEventListener('drop', (e)=> fileDrop(e, false));
window.addEventListener('click',(e)=> {(e.target.id!='') ? boundaryClick(e) : ''});
window.addEventListener('keypress',(e)=>{
    (e.key=='=') ? runFileScroll(false) : '';
    (e.key=='-') ? runFileScroll(e) : '';
});
