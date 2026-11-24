class PixelGrid {
  cells: string[];
  constructor(public size=16){this.cells=Array(size*size).fill("#ffffff");}
  paint(x:number,y:number,color:string){if(Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<this.size&&y<this.size)this.cells[y*this.size+x]=color;}
  clear(){this.cells.fill("#ffffff");}
}
const canvas=document.querySelector<HTMLCanvasElement>("#board");
if(canvas){
 const grid=new PixelGrid(), ctx=canvas.getContext("2d")!, color=document.querySelector<HTMLInputElement>("#color")!;
 const draw=()=>grid.cells.forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(i%16*20,Math.floor(i/16)*20,20,20);});
 canvas.addEventListener("pointerdown",e=>{const r=canvas.getBoundingClientRect();grid.paint(Math.floor((e.clientX-r.left)/r.width*16),Math.floor((e.clientY-r.top)/r.height*16),color.value);draw();});
 document.querySelector("#clear")!.addEventListener("click",()=>{grid.clear();draw();});
 document.querySelector("#export")!.addEventListener("click",()=>{const a=document.createElement("a");a.download="pixel-art.png";a.href=canvas.toDataURL();a.click();});
 draw();
}
