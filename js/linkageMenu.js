(function($){
    /*
     说明：  联动菜单，一般用在省，市，区三级联动上，注意这个函数是不限制级别的
     用法：  $.linkageMenu({
             target:['province','city','area'],
             url:[]
             });
     */
    $.extend({
        'linkageMenu':function(opts){
            var set = $.extend({
                'target':['province','city','area'], //需要联系的元素ID
                'url':[]  //与上面相对应的内容加载地址
                //'relate':[0,0,['province','city']] //设置关联，比如第三个是根据第一个和第二个的值来的
                //'callback':[0,0,0] //可以指定特殊回调函数
                //'showLevel':2 //显示级别，有时候三级联动只需要显示两级
                //'change':[0,0,0] //值被修改后执行的函数,可以是一个函数，也可以是函数组成的数组
            },opts||{});

            var showLevel = set.showLevel || set.target.length;
            var n = 0,len=set.target.length,o,xhr,$first = $('#'+set.target[n]),sfn = $first[0].name || $first.data('name');
            var loadData = function(url,name,v,index,callback){
                var N = $('#'+set.target[index]),aOther = set.target.slice(index),relate = set.relate && set.relate[index],oselect,V=[], F,sn,sv;
                var sCallback = set.callback ? ( $.isArray(set.callback) ? set.callback[index] : set.callback ) : null;
                if(relate){
                    for(var k = 0,kl = relate.length;k<kl;k++){
                        oselect = $('#'+relate[k]);
                        sn = oselect[0].name || oselect.data('name');
                        sv = oselect[0].value || oselect.data('value') || '';
                        //确保关联的每一个都有值
                        if(sv === ''){
                            F = true;
                            break;
                        };
                        V.push(sn + '='+ sv);
                    };
                    F && (V = []);
                };
                for(var j=0,L=aOther.length;j<L;j++){
                    o = $('#'+aOther[j]).get(0);
                    if(o.nodeName.toLowerCase() == 'select'){
                        o.options.length = 1;
                    }else{
                        o.innerHTML = '';
                    };
                };
                if(v === '') return;
                xhr && xhr.abort();
                if(N[0].nodeName.toLowerCase() == 'select'){
                    N.find('option').eq(0).text('\u52a0\u8f7d\u4e2d...');
                }else{
                    N.html('\u52a0\u8f7d\u4e2d...')
                };
                V.push(name+'='+v);
                url += (url.indexOf('?') > -1 ? '&' : '?') + V.join('&');
                xhr = $.ajax({
                    type:'GET',
                    url:url,
                    dataType:'json',
                    success:function(data){
                        if(N[0].nodeName.toLowerCase() == 'select'){
                            N.find('option').eq(0).text('\u8bf7\u9009\u62e9');
                        }else{
                            N.html('');
                        }
                        if(!data.length){set.noDataback && set.noDataback();};
                        if(data && data.length){
                            var html = '';
                            if(sCallback){
                                sCallback && sCallback(N,data,name,v);
                            }else{
                                $.each(data,function(i,item){
                                    html+='<option value="'+item.id+'" title="'+item.name+'">'+item.name+'</option>';
                                });
                                N.length > 0 && (N.append($(html)));
                            };
                            callback && callback(N,v);
                        };
                    }
                });
            };

            var setValue = function(obj,val,n){
                var f = obj[0].nodeName.toLowerCase() === 'select';
                var change = set.change ? ( $.isArray(set.change) ? set.change[n] : set.change ) : null;
                var setValueFn = set.setValueFn ? ( $.isArray(set.setValueFn) ? set.setValueFn[n] : set.setValueFn ) : null;
                if(f){
                    //setTimeout for ie6
                    setTimeout(function(){
                        obj.val(val);
                    },0);
                    //非IE6下可直接用下面的
                    //obj.val(val);
                }else{
                    obj.data('value',val);
                    setValueFn && setValueFn(obj,val,n);
                };

                $.isFunction(change) && change.call(obj,val);
            };

            loadData(set.url[n],sfn,null,n,function(obj,v){
                var D = obj.data('init'),fn;
                D = D && eval(D);
                if(D && D.length){
                    setValue($('#'+set.target[n]),D[n],n);
                    fn = function(){
                        //setTimeout for ie6
                        setTimeout(function(){
                            var v = D.shift(),el = $('#'+set.target[n]),sn = el[0].name || el.data('name');
                            v　!= '' &&　loadData(set.url[++n],sn,v,n,function(obj,v){
                                setValue(obj,D[0],n)
                                D.length > 1 && (n < showLevel-1 ) && fn();
                            });
                        },0);
                    };
                    fn();
                };
            });

            $(set.target).each(function(i){
                if(showLevel <= i) $('#'+set.target[i]).hide();
                var $el = $('#'+this),ev = $el[0].nodeName.toLowerCase() === 'select' ? 'change' : 'click';
                $el[ev](function(event){
                    var v = this.value || $(event.target).data('value'),n =this.name || $el.data('name');
                    var change = set.change ? ( $.isArray(set.change) ? set.change[i] : set.change ) : null;
                    $el.data('value',v);
                    $.isFunction(change) && change.call(this,v,i,$(event.target));
                    if(i >= showLevel-1 || i == len-1) return;
                    loadData(set.url[i+1],n,v,i+1);
                });
            });
        }
    });
})(jQuery);
