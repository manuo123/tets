/*为元素设置class属性：
   1. 网页中一切元素都是一个对象！
   2. html标准属性都可用对象.方式访问
   3. 特殊：html中的class-->className
            因为class属性默认表示一个对象的类型名,内部属性
*/
/*习惯
	1. 对象自己的方法访问自己的属性或调用自己的其他方法时
	   必须加this！
	2. 对象的每个属性和方法间都要用逗号分隔！
	   Unexpected identifier
*/
if(!Function.prototype.bind){
	Function.prototype.bind=function(obj){
		//this-->当前调用bind方法的函数对象fun
		//将当前函数对象保存为一个局部变量
		var fun=this;//calcSal(base,bonus,other)
		var args=//将类数组对象转为普通数组
			Array.prototype.slice.call(arguments,1);
		//仅获取除obj参数外的剩余参数：[1:8000]
		//闭包封装了：fun,obj,args
		return function(/*后续参数列表*/){
			//每次调用fun时，都用obj
			fun.apply(obj,args.concat(
				Array.prototype.slice.call(arguments)
			));
		}
	}
}
function $(id){
	return document.getElementById(id);
}
var game={
	data:[],//保存4x4个单元格中数据的二维数组
	RN:4,//总行数
	CN:4,//总列数
	score:0,
	top:0,//最高分
	state:1,//游戏的状态：进行中:1  结束:0
	RUNNING:1,//运行状态
	GAMEOVER:0,//结束状态
	PLAYING:2,//动画播放中状态
	init:function(){//初始化所有格子div的html代码
		//设置id为gridPanel的宽为: CN*116+16+"px";
		$("gridPanel").style.width=this.CN*116+16+"px";
		//设置id为gridPanel的高为: RN*116+16+"px";
		$("gridPanel").style.height=this.RN*116+16+"px";
		var grids=[];
		var cells=[];
		//r从0开始,到<RN结束，每次++
		for(var r=0;r<this.RN;r++){
		//	c从0开始,到<CN结束，每次++
			for(var c=0;c<this.CN;c++){
		//		在grids中push一个字符串: 
				grids.push(
				'<div id="g'+r+c+'" class="grid"></div>'
				);
		//		在cells中push一个字符串:
				cells.push(
				'<div id="c'+r+c+'" class="cell"></div>'
				);
			}
		}//(遍历结束)
		//找到id为gridPanel的div,设置内容为：
		//	grids无缝拼接的结果+cells无缝拼接的结果
		$("gridPanel").innerHTML=grids.join("")
			                    +cells.join("");
	},
	start:function(){//开始游戏方法
		this.init();//生成游戏界面
		animation.init();
		//var self=this;//***留住this***
		//r从0开始，到<RN结束，遍历每一行
		for(var r=0;r<this.RN;r++){
			this.data.push([]);//在data中压入一个空数组
			//	c从0开始，到<CN结束，遍历行中每个格
			for(var c=0;c<this.CN;c++){
				this.data[r][c]=0;//设置data中当前位置为0
			}
		}
		this.score=0;//初始化分数为0
		$("top").innerHTML=this.getTop();
		this.state=this.RUNNING;//初始化游戏状态为运行
		$("gameOver").style.display="none";
		this.randomNum();//生成1个随机数
		this.randomNum();//再生成1个随机数
		this.updateView();//更新页面元素
		//绑定键盘事件:当键盘按下时，自动触发
		document.onkeydown=function(){//自动获得事件对象
			if(this.state==this.RUNNING){
				var e=window.event||arguments[0];
					//  IE8           IE9+或其它
				//alert(e.keyCode);//打桩！
				switch(e.keyCode){//判断按键号
					case 37: this.moveLeft(); break;
					case 38: this.moveUp(); break;
					case 39: this.moveRight(); break;
					case 40: this.moveDown(); break;
				}
			}
		}.bind(this);
	},
	updateView:function(){
		//遍历data中每个元素
		for(var r=0;r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
			//	拼id: "c"+r+c
			//  找到指定id的格子div对象，保存在变量div中
				var div=$("c"+r+c);
			//  如果当前元素的值为0,(清空div的样式和内容)
				if(this.data[r][c]==0){
			//		将div的内容设置为""
					div.innerHTML="";
			//      设置div的class属性为"cell"
					div.className="cell";
				}else{//	否则
			//		将div的内容设置为当前元素的值
					div.innerHTML=this.data[r][c];
			//	设置div的class属性为"cell n"+当前元素的值
					div.className="cell n"+this.data[r][c];
				}
			}
		}
		//找到id为"score"的span，直接修改其内容为游戏的score属性值
		$("score").innerHTML=this.score;
		//span对象

		//调用isGameOver方法,如果返回true
		if(this.isGameOver()){
		//	修改游戏状态为GAMEOVER
			this.state=this.GAMEOVER;
		//	找到id为finalScore的span，设置内容为游戏的分数
			$("finalScore").innerHTML=this.score;
		//	找到id为gameOver的div，显示出来
			$("gameOver").style.display="block";
			if(this.score>this.getTop()){
				this.setTop(this.score);
			}
		}
	},
	setTop:function(value){//将value写入cookie中的top变量
		var now=new Date();
		now.setFullYear(now.getFullYear()+1);
		document.cookie="top="+value+";expires="+
			            now.toGMTString();
	},
	getTop:function(){//从cookie中读取top变量的值
		var top=parseInt(document.cookie.slice(4));
		return isNaN(top)?0:top;
	},
	isGameOver:function(){
		for(var r=0;r<this.RN;r++){//遍历data中每个元素
			for(var c=0;c<this.CN;c++){
				//如果当前元素等于0
				if(this.data[r][c]==0){
					return false;//返回false
				}else if(c!=this.CN-1
				&&this.data[r][c]==this.data[r][c+1]){
		//	否则，如果c不是最右侧列且当前元素等于右侧元素
					return false;//返回false
				}else if(r!=this.RN-1
				&&this.data[r][c]==this.data[r+1][c]){
		//	否则，如果r不是最下方行且当前元素等于下方元素
					return false;//返回false
				}
			}
		}//(遍历结束)
		return true;//返回true
	},
	randomNum:function(){//生成1个随机数的方法
		for(;;){//死循环
			//在0~RN-1之间生成一个随机行号，保存在变量r中
			var r=Math.floor(Math.random()*this.RN);
			//在0~CN-1之间生成一个随机列号，保存在变量c中
			var c=Math.floor(Math.random()*this.CN);
			//如果data中r行c列的元素==0
			if(this.data[r][c]==0){
			//	再生成一个随机数，
			//	如果<0.5，就在data中r行c列放入2
			//			  否则放入4
				this.data[r][c]=Math.random()<0.5?2:4;
			//	退出循环
				break;
			}
		}
	},
	move:function(iterator){//iterator专门执行for的函数
		var before=this.data.toString();
		iterator.call(this);
		var after=this.data.toString();
		if(before!=after){
			//修改游戏状态为播放动画状态
			//播放动画状态下，不响应键盘事件
			this.state=this.PLAYING;
			//启动动画，传入回调函数
			//回调函数在动画播放完成后，自动执行
			//动画完成后，生成随机数，更新页面，修改动画状态为运行状态，才可继续响应按键事件
			//回调函数要提前绑定this为game对象。
			animation.start(function(){
				this.randomNum();
				this.updateView();
				this.state=this.RUNNING;
			}.bind(this));
		}
	},
	moveLeft:function(){//遍历每一行，针对每一行执行左移
		this.move(function(){
			for(var r=0;r<this.RN;r++){
				this.moveLeftInRow(r);
			}
		});
	},
	moveLeftInRow:function(r){//仅移动指定的一行
		//从0位置开始，到<CN-1结束,遍历r行中每个元素
		for(var c=0;c<this.CN-1;c++){
			var nextc=this.getRightInRow(r,c);
			//console.log(nextc);
		//	如果没找到，就退出循环
			if(nextc==-1){break;}
			else if(this.data[r][c]==0){
				//否则, 如果当前元素是0
		//			将nextc位置的值换到当前位置
				this.data[r][c]=this.data[r][nextc];
		//			将nextc位置设置为0
				this.data[r][nextc]=0;
				animation.addTask(
					$("c"+r+nextc),r,nextc,r,c);
		//          c留在原地(抵消循环中的变化)
				c--;
			}else if(this.data[r][c]
						==this.data[r][nextc]){
			//否则 如果当前元素==nextc位置的元素
		//		    将当前位置*=2
				this.data[r][c]*=2;
		//			将nextc位置设置为0
				this.data[r][nextc]=0;
				//将合并后当前元素的值，计入总分
				this.score+=this.data[r][c];
				animation.addTask(
					$("c"+r+nextc),r,nextc,r,c);
			}
		}
	},
	//查找指定位置右侧下一个不为0的位置下标
	getRightInRow:function(r,c){
		//nextc从c+1开始，遍历r行右侧剩余元素
		for(var nextc=c+1;nextc<this.CN;nextc++){
		//	如果当前位置!=0
			if(this.data[r][nextc]!=0){
		//		返回nextc
				return nextc;
			}
		}//(遍历结束)
		//返回-1
		return -1;
	},
	moveRight:function(){
		this.move(function(){
			for(var r=0;r<this.RN;r++){
			//	每遍历一行，就调用moveRightInRow，传入r
				this.moveRightInRow(r);
			}//(遍历结束)
		});
	},
	moveRightInRow:function(r){//遍历data中r行每个元素
		//c从CN-1开始，到>0结束，每次--，
		for(var c=this.CN-1;c>0;c--){
		//	获得左侧下一个不为0的位置,保存在prevc
			var prevc=this.getLeftInRow(r,c);
		//	如果没找到,退出循环
			if(prevc==-1){break;}
		//	否则，如果当前元素等于
			else if(this.data[r][c]==0){
		//		将prevc位置的元素值替换到当前元素
				this.data[r][c]=this.data[r][prevc];
		//		将prevc位置的元素设置为0
				this.data[r][prevc]=0;
				animation.addTask(
					$("c"+r+prevc),r,prevc,r,c);
		//		c留在原地
				c++;
				
			}else if(this.data[r][c]
						==this.data[r][prevc]){
			//  否则，如果当前元素等于prevc位置的元素
		//		将当前元素*2
				this.data[r][c]*=2;
		//		将prevc位置的元素设置为0
				this.data[r][prevc]=0;
				//将合并后当前元素的值，计入总分
				this.score+=this.data[r][c];
				animation.addTask(
					$("c"+r+prevc),r,prevc,r,c);
			}
		}
	},
	getLeftInRow:function(r,c){//遍历c位置前的剩余元素
		//prevc从c-1开始，到>=0结束，每次--
		for(var prevc=c-1;prevc>=0;prevc--){
		//	如果prevc位置的元素!=0
			if(this.data[r][prevc]!=0){
		//		返回prevc
				return prevc;
			}
		}//(遍历结束)
		return -1;//返回-1
	},
	moveUp:function(){
		this.move(function(){
		  for(var c=0;c<this.CN;this.moveUpInCol(c),c++);
		});
	},
	moveUpInCol:function(c){//仅移动指定的一行
		for(var r=0;r<this.RN-1;r++){
			var nextr=this.getDownInCol(r,c);
			if(nextr==-1){break;}
			else if(this.data[r][c]==0){
				this.data[r][c]=this.data[nextr][c];
				this.data[nextr][c]=0;
				animation.addTask(
					$("c"+nextr+c),nextr,c,r,c);
				r--;
			}else if(this.data[r][c]
						==this.data[nextr][c]){
				this.data[r][c]*=2;
				this.data[nextr][c]=0;
				//将合并后当前元素的值，计入总分
				this.score+=this.data[r][c];
				animation.addTask(
					$("c"+nextr+c),nextr,c,r,c);
			}
		}
	},
	getDownInCol:function(r,c){
		for(var nextr=r+1;nextr<this.RN;nextr++){
			if(this.data[nextr][c]!=0){
				return nextr;
			}
		}
		return -1;
	},
	moveDown:function(){
		this.move(function(){
			for(var c=0;c<this.RN;this.moveDownInCol(c),c++);
		});
	},
	moveDownInCol:function(c){
		for(var r=this.RN-1;r>0;r--){
			var prevr=this.getUpInCol(r,c);
			if(prevr==-1){break;}
			else if(this.data[r][c]==0){
				this.data[r][c]=this.data[prevr][c];
				this.data[prevr][c]=0;
				animation.addTask(
					$("c"+prevr+c),prevr,c,r,c);
				r++;
			}else if(this.data[r][c]
						==this.data[prevr][c]){
				this.data[r][c]*=2;
				this.data[prevr][c]=0;
				//将合并后当前元素的值，计入总分
				this.score+=this.data[r][c];
				animation.addTask(
					$("c"+prevr+c),prevr,c,r,c);
			}
		}
	},
	getUpInCol:function(r,c){
		for(var prevr=r-1;prevr>=0;prevr--){
			if(this.data[prevr][c]!=0){
				return prevr;
			}
		}
		return -1;
	}
}
//页面加载后：页面加载后自动触发！
window.onload=function(){
	game.start();
}