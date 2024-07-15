function getUltimateProxy(obj){

    let proto = Object.getPrototypeOf(obj);
        proto = proto ? getUltimateProxy( Object.getPrototypeOf(obj) ) : proto;

    return new Proxy(obj, {

        getPrototypeOf: function(target){
            console.log("getPrototypeOf", target);
            return protoProxy;
        },

        setPrototypeOf: function(target, prototype){
            console.log("setPrototypeOf", target, prototype);
            return Object.setPrototypeOf(target, getUltimateProxy(prototype));
        },

        isExtensible: function(target){
            console.log("isExtensible", target);
            return Object.isExtensible(target);
        },

        preventExtensions: function(target){
            console.log("preventExtensions", target);
            return Object.preventExtensions(target);
        },

        getOwnPropertyDescriptor: function(target, prop){
            console.log("getOwnPropertyDescriptor", target, prop);
            return Object.getOwnPropertyDescriptor(target, prop);
        },

        defineProperty: function(target, prop, descriptor){
            console.log("defineProperty", target, prop, descriptor);
            return Object.defineProperty(target, prop, descriptor);
        },

        has: function(target, prop){
            console.log("has", target, prop);
            return prop in target;
        },

        get: function(target, prop, receiver){
            console.log("get", target, prop, receiver);
            return target[prop];
        },

        set: function(target, prop, value, receiver){
            console.log("set", target, prop, value, receiver);
            target[prop] = value;
            return true;
        },

        deleteProperty: function(target, prop){
            console.log("deleteProperty", target, prop);
            return delete target[prop];
        },

        ownKeys: function(target){
            console.log("ownKeys", target);
            return Object.keys(target);
        },
        
        apply: function(target, thisArg, argumentsList){
            console.log("apply", target, thisArg, argumentsList);
            return target.apply(thisArg, argumentsList);
        },

        construct: function(target, argumentsList, newTarget){
            console.log("construct", target, argumentsList, newTarget);
            return new target(...argumentsList);
        }

    });

}