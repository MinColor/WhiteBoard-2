//回放这个对象
var PlayBack = function(allData)
{
	this.allData = allData;      //把回放的数据放在内存中
	this.index = 0 ;             //当前数据下标
	this.time = 0 ;              //当前时间
	this.length = allData.length;   //数据的长度
	this.isStop = true;             //是否属于暂停状态
	this.isEnd = false;
};

//设置当前时间
PlayBack.prototype.setTime = function (time) {
	this.time = time;
};

//设置当前已经运行到哪个位置的下标
PlayBack.prototype.setIndex = function (index) {
	this.index = index;
}


//根据不同的事件id调用不同的借口播放
PlayBack.prototype.play = function (opId,dataEvent) {
	switch(opId) {
		case "canvas":
			replay.playFromJson(dataEvent);
			break;
		case "begin":
			break;
		case "end":
			this.isStop = true;
			break;
	}	
}

//播放事件
PlayBack.prototype.playEvent = function()
{
	for (var i = this.index ; ; i++) {
		var dataEnd = eval(this.allData[i]);
		var dataBegin = eval(this.allData[this.index]);
		if (dataEnd[0].opTime-dataBegin[0].opTime <= 40) {
			this.play(dataEnd[0].opId,dataEnd[0]);
		}
		else {
			break;
		}
	}	
	
	this.index = i;
	
};

PlayBack.prototype.start = function()
{
	var that = this;
	this.isStop = false;
	var i = this.index+1;
	var dataBegin = eval(this.allData[this.index]);
	this.play(dataBegin[0].opId,dataBegin[0]);
	var that = this;

	function myfor()
	{
		if(!that.isStop)
		{
			var dataEnd = eval(that.allData[i]);
			dataBegin = eval(that.allData[i-1]);
			var time = dataEnd[0].opTime-dataBegin[0].opTime;
			if(i < that.allData.length)
			{
				window.setTimeout(function(){
					that.play(dataEnd[0].opId,dataEnd[0]);
					myfor();
				}, time);
			}
			i++;
			that.setIndex(i);
			that.setTime(time+that.time);
		}
	}
	myfor();
	
}

//回放对象的暂停函数
PlayBack.prototype.stop = function()
{
	if(this.isStop == false)
	{
		console.log(this.time);
		this.isStop = true;
	}
	else
	{
		this.isStop = false;
		this.start();
	}
	
};

//回放对象的快进函数
PlayBack.prototype.forward = function()
{
	this.isStop = true;  //先停止在快进时间
	var dataBegin = eval(this.allData[0]);
	this.time = this.time+2000;  //快进两秒
	
	//查找快进的时间内，按正常时间情况下应该到了哪个事件结点
	for(var i = this.index; i < this.length ; i++)
	{
		var dataEnd = eval(this.allData[i]);
		
		var nowTime = dataEnd[0].opTime-dataBegin[0].opTime;  //获取要读取的下一个事件结点开始的时间
		if (nowTime <= this.time) {
			this.play(dataEnd[0].opId,dataEnd[0]);
		}
		else
		{
			break;			
		}
	}
	this.index = i;
	this.isStop = false;  //又重新开始播放
	this.start();
};

//回放对象的快退函数
PlayBack.prototype.backward = function(context,canvas)
{
	this.isStop = true;
	this.time = this.time-2000;  //快退两秒
	var dataBegin = eval(this.allData[0]);
	context.clearRect (0 , 0, canvas.width , canvas.height );
	this.index = 0 ;
	for(var i = 0 ; i < this.length; i++)
	{
		var dataEnd = eval(this.allData[i]);
		var nowTime = dataEnd[0].opTime-dataBegin[0].opTime;  //当前结点距离开始结点的时间
		if(nowTime > this.time)
		{
			break;
		}
		else
		{
			this.index++;
			this.play(dataEnd[0].opId,dataEnd[0]);
		}
	}
	this.isStop = false;
};


