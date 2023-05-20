<script>
import { ref, inject } from 'vue';

export default {
  props: {
  },

  setup(props) {
    var page = ref("setup");
    var current = ref(null);
    var system = ref("");
    var state = ref(null);
    var error = ref("");
    var warning = ref("");

    var username = ref("");
    var password = ref("");

    var identity = inject("identity");
    var local_sign = identity.local_sign;
    var client = identity.client;

    var go_back = inject("on_back");
    var go_next = inject("on_next");

    var splitter = "両"; //同两

    function get_account() {
      var passphrase = [username.value, password.value].join(splitter);
      var account = local_sign.generate(passphrase);
      // console.log("generate", account);
      return account;
    }

    function import_account() {
      var account = local_sign.import(password.value);
      // console.log("import", account);
      return account;
    }

    function go_page(p) {
      username.value = "";
      password.value = "";
      error.value = "";

      page.value = p;
    }

    function on_system(){
      go_page('home');
      check_system(function(){
        ;
      });
    }

    function active_account(account, callback) {
      client.with("eth.0xc287B1266732495Fe8c93CE3Ba631597153fdd91").get_account(account.address, function(data){
        if(data && data.result){
          callback && callback(data);
        }else{
          identity.sendWith("eth.0xc287B1266732495Fe8c93CE3Ba631597153fdd91", {
            account: account.address,
            secret: account.private
          }, callback);
        }
      });
    }

    function on_create() {
      var account = get_account();
      var address = account.address;
      client.get_account(address, function(data){
          var s = data && data.result;
          if(s != null){
            error.value = "身份已存在";
          }else{
            var e = data && data.error;
            if(e != null){
              active_account(account, function(data){
                var r = data && data.result;
                if(r != null){
                  current.value = account;
                  go_page("wait");

                  var timer = setInterval(function(){
                    client.get_account(account.address, function(data){
                        var s = data && data.result;
                        if(s != null){
                          clearInterval(timer);

                          state.value = s;
                          go_page("home");
                        }
                    });
                  }, 3000);
                }else{
                  error.value = "创建身份出错";
                }
              });
            }else{
              error.value = "网络错误";
            }
          }
      });
    }

    function on_use(){
      var account = get_account();
      var address = account.address;
      client.get_account(address, function(data){
          var s = data && data.result;
          if(s != null){
            state.value = s;
            current.value = account;
            go_page("home");
          }else{
            var e = data && data.error;
            if(e != null){
              error.value = "身份不存在";
            }else{
              error.value = "网络错误";
            }
          }
      });
    }

    function on_import(){
      var account = import_account();
      var address = account.address;
      client.get_account(address, function(data){
          var s = data && data.result;
          if(s != null){
            state.value = s;
            current.value = account;
            go_page("home");
          }else{
            var e = data && data.error;
            if(e != null){
              error.value = "身份不存在";
            }else{
              error.value = "网络错误";
            }
          }
      });
    }

    function on_home() {
      go_page("home");
    }

    function on_back() {
      state.value = null;
      current.value = null;
      go_back && go_back(system.value);
    }

    function on_next() {
      identity.account = current.value;
      identity.contract = system.value;
      go_next && go_next(system.value, identity);
    }

    function on_view(msg) {
      alert(msg);
    }

    function check_system(callback) {
      var contract = system.value;
      client.get_account(contract, function(data){
        var c = data && data.result;
        if(c != null){
          if(c.Code != null){
            callback && callback();
          }else{
            warning.value = "合约不存在";
          }
        }else{
          warning.value = "系统不存在";
        }
      });
    }

    return {
      page,
      current,
      system,
      state,
      error,
      warning,

      username,
      password,

      check_system,

      on_create,
      on_use,
      on_import,
      on_home,
      on_view,
      on_system,

      on_back,
      on_next
    };
  },

  mounted() {
  }
}
</script>

<template>
  <div>
    <div class="right">
      <div v-if="page == 'setup'">
        <div v-if="system == null || system == ''">
          <button @click="page='system'">登录</button>
        </div>
      </div>
      <div v-if="page == 'system'">
        <div>系统：<input type="text" v-model="system" class="account"/></div>
        <div>
          <input type="button" @click="on_system" value="登陆" />
          <input type="button" @click="page = 'setup'" value="返回" />
        </div>
      </div>
      <div v-if="page == 'wait'">
        <div>系统：{{ system }} </div>
        <div>身份：{{ current.address }} </div>
        <div>
        等待创建身份成功...
        </div>
      </div>
    </div>
    <div class="center">
      <div v-if="page == 'home'">
        <div v-if="current != null">
          <div v-if="state != null" class="gray">
            <div>身份</div>
            <div class="space"></div>
            <div>
              <div>类型: {{ current.type }}</div>
              <div>地址: {{ current.address }}</div>
              <div>公钥: *** <input type="button" @click="on_view(current.public)" value="查看" /></div>
              <div>私钥: *** <input type="button" @click="on_view(current.private)" value="查看" /></div>
            </div>
            <div class="space"></div>
            <div>帐户</div>
            <div class="space"></div>
            <div>
              <div v-if="username != null && username.length > 0">User: {{ username }}</div>
              <div>Sequence: {{ state.Sequence }}</div>
              <div>Version: {{ state.Version }}</div>
            </div>
            <div class="green" v-if="state.PublicKey != null && state.PublicKey.length > 0">
              <div>PublicKey: *** <input type="button" @click="on_view(state.PublicKey)" value="查看" /></div>
            </div>
            <div class="green" v-if="state.User != null">
              <div>User: {{state.User.Hash}}</div>
            </div>
            <div class="green" v-if="state.Code != null">
              <div>Code: {{state.Code.Hash}}</div>
            </div>
            <div class="green" v-if="state.Page != null">
              <div>Page: {{state.Page.Hash}}</div>
            </div>
            <div class="green" v-if="state.Token != null">
              <div>Token: {{state.Token.Hash}}</div>
            </div>
            <div class="green" v-if="state.Contract != null">
              <div>Contract: {{state.Contract.Hash}}</div>
            </div>
            <div class="green" v-if="state.Data != null">
              <div>Data: {{state.Data.Hash}}</div>
            </div>
            <div class="space"></div>
            <div class="dark">
              <div>准备使用</div>
              <div :class="{green: warning == null || warning.length == 0, error: warning != null && warning.length > 0}">{{ system }} 
                <span v-if="warning != null && warning.length > 0">({{ warning }})</span>
              </div>
              <div v-if="warning != null && warning.length > 0">
                <input type="button" @click="on_back()" value="返回" />
              </div>
              <div v-else>
                <input type="button" @click="on_next()" value="下一步" />
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <div>
            <div>创建身份</div>
            <div>
              以使用 
              <span :class="{green: warning == null || warning.length == 0, error: warning != null && warning.length > 0}">{{ system }} 
                <span v-if="warning != null && warning.length > 0">({{ warning }})</span>
              </span></div>
          </div>
          <div>
            <button @click="page='register'">创建新的身份</button>
          </div>
          <div>
            <button @click="page='login'">使用现有身份</button>
          </div>
          <div>
            <button @click="page='import'">导入现有身份</button>
          </div>
          <div class="large-space"></div>
          <div>
            1. 该身份系统使用用户名与密码组合在浏览器端生成公私钥（亦可直接导入私钥）作为帐户；<br />
            2. 该身份系统不存放任何用户名与密码相关的信息；<br />
            3. 该身份系统中用户相关的数据归属用户；<br />
            4. 该身份系统使用到的相关系统开放且透明；<br />
            5. 其他事宜请参考相关规定；<br />
          </div>
        </div>
      </div>
    </div>
    <div class="right">
      <div>
        <div v-if="page == 'register'">
          <div>用户：<input type="text" v-model="username"/></div>
          <div>密码：<input type="password" v-model="password"/></div>
          <div>
            <input type="button" @click="on_create" value="创建" />
            <input type="button" @click="on_home" value="返回" />
          </div>
        </div>
        <div v-if="page == 'login'">
          <div>用户：<input type="text" v-model="username"/></div>
          <div>密码：<input type="password" v-model="password"/></div>
          <div>
            <input type="button" @click="on_use" value="使用" />
            <input type="button" @click="on_home" value="返回" />
          </div>
        </div>
        <div v-if="page == 'import'">
          <div>私钥：<textarea rows="3" v-model="password" class="account"/></div>
          <div>
            <input type="button" @click="on_import" value="导入" />
            <input type="button" @click="on_home" value="返回" />
          </div>
        </div>
        <div v-if="error != null && error.length > 0" class="error">> {{ error }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.space {
  height: 12px;
}
.large-space {
  height: 64px;
}
.error {
  font-size:90%;
  color: red;
}
.right {
  display: flex;
  flex-direction: row-reverse;
}
.center {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.dark {
  color: rgb(80, 80, 80);
}
.gray {
  color: gray;
}
.green {
  color: green;
}
.account {
  width: 345px;
}
</style>
