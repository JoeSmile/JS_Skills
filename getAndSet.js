/**
 * 控制访问 getter setter
 * 
 * 1. getter 
 *  a: prop 指的是要绑定到给定函数的属性名
 *  {get prop() {...} }
 * 
 *  b: 还可以使用一个计算属性名的 experssion 绑定到给定的函数，注意浏览器的兼容性
 *  {get [expression]() {...}} 
 * 
 *  注意：
 *  使用 get 语法时应注意以下问题：
1.可以使用数值或字符串作为标识
2.必须不带参数
3.不能与另一个get或具有相同属性的数据条目的对象字面量中出现
*/

var obj = {
_name: 'Joe',
// 这个function的名称不能和已有的属性名相同，本例中若有_name(){} 会报错
get name() {
    return this._name
}
}

console.log('obj._name:',obj._name)

var expr = 'foo'
var obj2 = {
    get [expr]() {
        return 'get expr'
    }
}
console.log('get [expr]', obj2.foo)

/*
delete 删除getter
*/
delete obj._name
console.log('obj._name:', obj._name)


/*
setter 
1.  prop 指定的是要绑定到给定函数的属性名
    val 指的是分配给prop的值
    {set prop(val) {...}}
2.  还可以使用一个计算属性名的 expression 绑定给定的函数，注意浏览器兼容性
    {set [expression](val) {...}}

注意： 同getter
*/
var language = {
_name: [],
set learn(param) {
    this._name.push(param)
}
}

console.info('init language:', language._name)
language.learn = 'Chinese'
language.learn = 'English'
console.info('after learn:', language._name)

var expr = 'foo'
var obj_set = {
baz: 'bar',
set [expr](v) {this.baz = v}
}

console.log('original baz:', obj_set.baz)
obj_set.foo = '123444'
console.log('after set baz:', obj_set.baz)


/**
 * 用 Object.defineProperty() 精确定义对象成员
 * 
 * obj 需要被操作的目标对象
 * prop 目标对象需要定义或修改的属性的名称
 * desciptor 将被定义或修改的属性的描述符
*   configurable 是否能被修改及删除      数据属性、存取方法
    enumerable   是否可被枚举           数据属性、存取方法
    value        属性值                数据属性
    writable     是否能被赋值运算符改变  数据属性
    get          getter 方法          存取方法
    set          setter 方法          存取方法
*/

var o = {};

o.a = 1;
// 等同于 :
Object.defineProperty(o, "a", {
value : 1,
writable : true,
configurable : true,
enumerable : true
});

// 相关方法：Object.getOwnPropertyDescriptor() 
// 注意：返回指定对象上一个自有属性对应的属性描述符。（自有属性指的是直接赋予该对象的属性，而非从原型链上进行查找的属性） 
// 用此特性可判断是否是继承的属性
Object.getOwnPropertyDescriptor(o, 'a')

// 相关方法：Object.defineProperties() 
// 注意：直接在一个对象上定义多个新的属性或修改现有属性 
Object.defineProperties(o,{
'a': {
    value: true,
    writable: true
},
'b': {
    value: 'Joe',
    writable: true
}
})

//相关方法: Object.create()
var obj_null = Object.create(null)

var foo = {a:1, b:2};
var o = Object.create(foo, {
// foo会成为所创建对象的数据属性
foo: { 
writable:true,
configurable:true,
value: "hello" 
},
// bar会成为所创建对象的访问器属性
bar: {
configurable: false,
get: function() { return 10 },
set: function(value) {
    console.log("Setting `o.bar` to", value);
}
}
});


/**
 * 在代理模式中，一个代理对象(Proxy)充当着另一个目标对象(Real Subject)的接口。
 * 代理对象居于目标对象的用户(Client)和目标对象本身的中间，并负责保护对目标对象的访问。
 * 
 * 典型的应用场景为：
对目标对象的访问控制和缓存
延迟目标对象的初始化
访问远端对象

代理模式与设计模式中另一种装饰者模式(Decorator Pattern)容易被混淆，
两者的相同之处在于都是对原始的目标对象的包装；不同之处在于，
前者着眼于提供与原始对象相同的API，并将对其的访问控制保护起来，
而后者则侧重于在原有API的基础上添加新的功能。
*/

function Book(id, name) {
this.id = id
this.name = name
}

function BookShop() {
    this.Books = {}
}

BookShop.prototype = {
    addBook: function(book) {
    this.books[book.id] = book
    },
    findBook: function(id) {
        return this.books[id]
    }
}


function BookShopProxy() {}

BookShopProxy.prototype = {
    _init: function() {
        if(this.bookshop) {
            return
        } else {
            this.bookshop = new BookShop
        }
    },

    addBook: function(book) {
        this._init()
        //实现对源obj的控制
        if(book.id in this.bookshop.books) {
            console.log('existed book!', book.id)
        } else {
            this.bookshop.addBook(book)
        }
    },

    findBook: function(id) {
        this._init()
        //实现对源obj的控制
        if(id in this.bookshop.books) {
            return this.bookshop.findBook(id)
        } else {
            return null
        }
    }
}

var person = {
    get age(){
        console.log('getter')
        return this._age;//这里千万不能return this.age,会出错
    },
    set age(val) {
        console.log('setter')
        this._age = val < 100 && val > 0 ? val:0
        //这边不需要返回值，在触发set方法后还会触发get方法，且set方法不允许单独存在
    }
};
person.age = 10 //10
person.age = 101 //0
person.age = 'age' //0
//在进行赋值操作时，会先触发set、后触发get，进行如person.age++的操作时，
//set、get的触发顺序为：get=>set=>get。以上就是ES5的getter/setter访问器。


// ES6的 proxy 可以是任何类型的对象，如 Object、Array、Function，
// 甚至另一个 Proxy 对象；在进行let proxy=new Proxy(target,handle)的操作后，
// proxy、target两个对象会相互影响。
// Proxy 对象也的确符合经典的代理模式 -- 由代理对象对目标对象的 API 进行封装和保护，隐藏目标对象，控制对其的访问行为。
/**
 *  "get": function (oTarget, sKey) 
    "set": function (oTarget, sKey, vValue)
    "enumerate": function (oTarget, sKey)
    "ownKeys": function (oTarget, sKey)
    "has": function (oTarget, sKey)
    "defineProperty": function (oTarget, sKey, oDesc)
    "deleteProperty": function (oTarget, sKey)
    "getOwnPropertyDescriptor": function (oTarget, sKey)
    "getPrototypeOf(oTarget)"
    "setPrototypeOf(oTarget, oPrototype)"
    "apply(oTarget, thisArg, argumentsList)":
    "construct(oTarget, argumentsList, newTarget)"
    "isExtensible(oTarget)"
    "preventExtensions(oTarget)"
    */

let target = {
    _prop: 'foo',
    prop: 'foo'
};

let handler = {
    get (target, key){
        return key in target
            ? target[key]
            : -1; //默认值
    },
    set (target, key, value) {
        if (key === 'age') { //校验
            target[key] = value > 0 && value < 100 ? value : 0
        }
        return true;//必须有返回值
    }
};

//与ES5 setter/getter访问器的区别是，在proxy中，proxy.age=1,只会执行 set的方法，
//而不是像ES5中的setter，会先执行set，后执行get。且proxy中的set必须有返回值，ES5的setter不用，
//这也正是因为在他之后还会执行getter,所以不需要。

let proxy = new Proxy(target, handler);
proxy._prop = 'bar';
target._attr = 'new'
console.log(target._prop) //'bar'
console.log(proxy._attr) //'new'


// 反射 对象的反射(reflection)是一种在运行时(runtime)探查和操作对象属性的语言能力。
// 反射一般被用于在运行时获取某个对象的类名、属性列表，然后再动态构造等；
// JS 本来也具有相关的反射API，比如 Object.getOwnPropertyDescriptor() 、
// Function.prototype.apply()、in、delete等，但这些 API 分布在不同的命名空间甚至全局保留字中，
// 并且执行失败时是以抛出异常的方式进行的。这些因素使得涉及到对象反射的代码难以书写和维护。
// Reflect 与 proxy的区别在于，Reflect偏重于读取属性

// 总结
// getter/setter 也被称为存取方法，是访问方法中最常用的两个
// 可以用访问方法封装保护原对象，并保留逻辑的灵活性
// ES5 中开始支持了隐式的 get 和 set 访问方法，可以通过 delete 删除
// 使用 使用 Object.defineProperty() 也可以设置 getter/setter 等
// 历史上利用 Object.prototype.define[G,S]etter() 和 onpropertychange 实现存取方法的兼容
// 可以利用代理和反射改善传统的访问控制
// 代理对象居于目标对象的用户和目标对象本身的中间，并负责保护对目标对象的访问
// ES6 原生的 Proxy 对象。用于定义基本操作的自定义行为（如属性查找，赋值，枚举，函数调用等）
// 对象的反射是一种在运行时探查和操作对象属性的语言能力
// ES6 引入了 Reflect 对象，用来囊括对象反射的若干方法
// Reflect 有和 Proxy 一一对应的若干种方法，经常搭配使用

