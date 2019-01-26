'use strict';

(function (global, $) {

// Exports
var ex = {}

ex.decodeHtml = function (html) {
    return $('<div />').html(html).text()
}

ex.ListView = function (options) {
    var me =  this;
    var el = options.domNode;

    var handleItemClick = options.handleItemClick;
    var itemFunction = options.itemFunction;

    var onClick = function (e) {
        var index = parseInt(e.target.getAttribute('data-x-item-index'))
        handleItemClick({e: e, index: index, item: me.items[index], itemNode: el.children[index]})
    }

    me.attach = function () {
        el.addEventListener('click', onClick)
    }

    me.detach = function () {
        el.removeEventListener('click', onClick)
    }

    me.refresh = function () {
        el.innerHTML = ''

        me.items.map(function (item, i) {
            var $li = $('<li>').attr('data-x-item-index', i)
            return itemFunction($li.get(0), item, i, me)
        }).forEach(function (item$) {
            el.appendChild(item$)
        }) 
    }
}


ex.createListView = function (options) {

    var me;

    var listOptions = {
        domNode: options.domNode,
        handleItemClick: function (params) {
            me.selectedIndices[params.index] = !me.selectedIndices[params.index];
            if (!me.selectedIndices[params.index])
                delete  me.selectedIndices[params.index];
            listOptions.itemFunction(params.itemNode, params.item, params.index)
            options.handleItemClick(params)
        },
        itemFunction: function (item$, item, i) {
            var $item = $(item$)
            $item.text(item.name)
            $item.toggleClass('selected', !!me.selectedIndices[i])

            return $item[0]
        }
    }

    me = new ex.ListView(listOptions)
    me.selectedIndices = {}

    return me
}



global.utils = ex;

})(window, $);
