<script>
import { ref, inject } from 'vue';

var identity;
var local_sign;
var client;

export default {
  props: {
    title: String
  },

  setup(props, context) {
    var current = ref(null);
    var state = ref(null);
    var in_map = ref({});
    var in_name = ref("");

    var system = ref("");

    identity = inject("identity");
    local_sign = identity.local_sign;
    client = identity.client;

    if(identity.account != null){
      current.value = identity.account;
      system.value = identity.contract;
      update_account(current.value.address);
      update_list();
    }

    function update_list(callback) {
      var account = current.value.address;
      client.call_contract(system.value, system.value, "list_register", ":string", function(data){
        var item = data && data.result && data.result;
        if(item != null){
          var list = JSON.parse("[" + item + "]");
          for(var i = 0; i < list.length; i ++){
            var line = list[i];
            var name = line[1];
            var address = line[2];
            in_map.value[address] = {
              name: name
            };
          }
        }
        callback && callback();
      });
    }

    function update_account(address, callback) {
      client.get_account(address, function(data){
        if(data && data.result){
          state.value = data.result;
          callback && callback();
        }
      });
    }

    function on_add_public() {
      var name = in_name.value;

      var from = current.value.address;
      var secret = current.value.private;
      var to = system.value;

      identity.send({
        account: from, 
        secret: secret,
        payload: {
          contract:{
            account: {
              data:to,
              code:to
            },
            method:"register",
            params:[
              {
                type:"string",
                value:""
              },
              {
                type:"string",
                value:name
              },
              {
                type:"string",
                value:from
              }
            ]
          }
        }
      }, function(data){
        setTimeout(function(){
          update_list(function(){
            console.log("list", in_map.value[from] != null);
          });
        }, 1000);
      });
    }


    return {
      current,
      state,

      in_map,
      in_name,

      system,

      on_add_public,
    };
  },

  mounted() {
  }
}
</script>

<template>
  <div>
    <div class="right">
      <div v-if="current != null">
        <div>> {{ current.address }}</div>
      </div>
    </div>
  </div>
  <div class="layout">
    <div v-if="current != null">
      <div>{{ title }}: {{ system }}</div>
<pre>
涉及数据说明：
1. 加入公布计划数据明文保存在系统（合约）帐户里；
2. 其他事宜请参考相关规定；
</pre>
    </div>
    <div class="right">
      <div>
        <div>
          <div v-if="state != null" class="gray">
            <div>
              <div>Sequence: {{ state.Sequence }}</div>
              <div>Version: {{ state.Version }}</div>
            </div>
            <div class="green" v-if="state.PublicKey != null && state.PublicKey.length > 0">
              <div>PublicKey: *</div>
            </div>
            <div class="green" v-if="state.User != null">
              <div>User: *</div>
            </div>
            <div class="green" v-if="state.Code != null">
              <div>Code: *</div>
            </div>
            <div class="green" v-if="state.Page != null">
              <div>Page: *</div>
            </div>
            <div class="green" v-if="state.Token != null">
              <div>Token: *</div>
            </div>
            <div class="green" v-if="state.Contract != null">
              <div>Contract: *</div>
            </div>
            <div class="green" v-if="state.Data != null">
              <div>Data: *</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="current != null">
      <div v-if="in_map[current.address] == null">
        <div>
          <input type="text" v-model="in_name" class="account" />
          <input type="button" @click="on_add_public" value="加入公布计划" />
        </div>
      </div>
      <div v-else class="green">
        > 已加入公布计划: {{ in_map[current.address] && in_map[current.address].name }}
      </div>
      <div class="space"></div>
      <div v-for="item, address in in_map" :key="address">
        <div v-if="address != current.address">- {{ address }} {{ item.name ? "(" + item.name + ")" : "" }} </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.space {
  height: 12px;
}
.layout {
  display: flex;
  flex-direction:column;
}
.right {
  display: flex;
  flex-direction: row-reverse;
}
.gray {
  color: gray;
}
.green {
  color: green;
}
</style>
