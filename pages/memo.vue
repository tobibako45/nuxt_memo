<template>
  <section class="container">
    <h1>Memo</h1>
    <table>
      <tr>
        <th>Title</th>
        <td>
          <!-- v-model="title"で、titleデータに値をバインド。-->
          <!-- @focus="set_flg"で、この入力フィールドにフォーカスが移ったら(選択して入力状態になったら)、set_flgを実行-->
          <input type="text" name="title"
                 class="title" size="40"
                 v-model="title" @focus="set_flg">

          <!-- @click="find"として、クリックしたらfindを実行するようにしてある-->
          <button @click="find">find</button>
        </td>
      </tr>
      <tr>
        <th>Memo</th>
        <td>
          <!-- v-model="content"としてcontentデータにバインド-->
          <textarea name="content" class="content"
                    cols="50" rows="5"
                    v-model="content"></textarea>
        </td>
      </tr>
      <tr>
        <th></th>
        <td>
          <!-- 入力したフォームの値をメモとして保存するボタン。@click="click"としてinsertを実行-->
          <button @click="insert">save</button>

          <!--
            リストから項目をクリックして、メモの内容がフォームに表示されたときに使えるようにします。
            そこで、<transition>を使ってトランジションを使う。
            <button>には、v-if"set_flg ! = false"と指定し、sel_flgの値がfalseでない場合に表示し、
            falseのときは非表示になるようにしておきます。
          -->

          <!--  <transition>とは？ CSSの切り替えでいろいろできるやつ。CSSのとこを見てね-->
          <transition name="del">
            <button v-if="sel_flg != false"
                    @click="remove">delete
            </button>
          </transition>
        </td>
      </tr>
    </table>
    <hr>
    <!--
      liには、v-for="item in page_items"を用意してループ。
      <span>で@click="select(item)"を指定し、クリックしたらselectを実行するようにしてある。
      また、表示する内容は、{{item.title}}と{{item.created}}の値を使っている。
     -->
    <ul class="list">
      <li v-for="item in page_items">
        <span @click="select(item)">{{ item.title }} ({{item.created}})</span>
      </li>
    </ul>
    <hr>
<!--    ページ移動は、<a>タグでなく、<span>を使っています。-->
<!--    これに@clickでprevとnextを実行するように設定しています。-->
<!--    これらの関数で、ページ移動を行うようにしている。-->
    <div class="nav"><span @click="prev">&lt;prev</span>｜
      <span @click="next">next&gt;</span></div>
  </section>
</template>

<script>
    export default {
        data: function () {
            return {
                // v-modelでバインドするもの。この中に入力された値が保管される。
                title: '',
                // v-modelでバインドするもの。この中に入力された値が保管される。
                content: '',
                // 1ページあたりの表示数を示す。
                num_per_page: 7,
                // 検索実行中を示す変数。これがtrueならば検索中。
                find_flg: false,
                // 項目を選択したかどうかを示す変数。選択状態でない場合はfalseになり、選択した場合はそのメモのオブジェクトが設定される
                sel_flg: false,
            };
        },

        computed: {
            // memoストアにあるmemoの値を取り出して返すプロパティ。
            // storeフォルダのmemo.jsにあるストアのステートは、$store.state.memoの中にまとめてあります。
            // Vuexでモジュールを使う場合、ステートの値は、「$store.state.モジュール名.◯◯」というように、
            // $store.stateの後にモジュール名を付けて指定します。
            // こうすることで、「どのモジュールにあるステートを使うか」を指定する
            memo: function () {
                return this.$store.state.memo.memo;
            },
            // リストに表示されるメモの配列を表すプロパティ。その時の状態によって取り出す値が変わる。
            page_items: function () {
                // ２つの変数、find_flgとsel_flgをチェックし、検索時、選択時、それ以外のときで異なるメモ配列を返す。

                if (this.find_flg) {        // 検索時の表示
                    var arr = [];
                    var data = this.$store.state.memo.memo;

                    // memo配列のすべてを繰り返し処理して、
                    data.forEach(element => {
                        // 取り出したメモのtitleの中に、入力フィールドに記入したテキスト（v-modelでバインドされてthis.titleに入っている）
                        // が、含まれているかチェック

                        // toLowerCase() 文字列の中の大文字を小文字に変換した新しい文字列を返します。
                        // indexOf(str[, start])  対象の文字列の先頭から引数に指定した文字列を検索します。

                        // toLowerCase()で、すべて少文字にしたものをindexOfでチェックしている。
                        if (element.title.toLowerCase().indexOf(this.title.toLowerCase()) >= 0) {
                            // push 配列の最後に追加する要素を指定します。
                            arr.push(element);
                        }
                    });
                    return arr;
                } else if (this.sel_flg != false) {   // 項目選択時の表示
                    return [this.sel_flg];
                } else {                                        // それ意外のときの表示
                    return this.$store.state.memo.memo.slice(
                        this.num_per_page * this.$store.state.memo.page,
                        this.num_per_page * (this.$store.state.memo.page + 1));
                }
            },
            // 現在のページ数を示す値。
            // この値は、$store.state.memo.pageの値をそのまま返せばOK。
            page: {
                get: function () {
                    return this.$store.state.memo.page;
                },
                set: function (p) {
                    var pg = p > (this.$store.state.memo.memo.length - 1)
                    / this.num_per_page ?
                        Math.ceil((this.$store.state.memo.memo.length - 1)
                            / this.num_per_page) - 1 : p;
                    pg = pg < 0 ? 0 : pg;

                    // 値の変更は、$store.commitメソッドで、memoにあるset_pageミューテーションを呼び出して行っている。
                    // 直接、$store.state.memo.pageの値を書き換えることはしない。
                    this.$store.commit('memo/set_page', pg);
                }
            },
        },

        methods: {
            // flg設定を行う。検索や選択中の状態から元の状態に戻すための処理。
            set_flg: function () {
                if (this.find_flg || this.sel_flg != false) {
                    this.find_flg = false;
                    this.sel_flg = false;
                    this.title = '';
                    this.content = '';
                }
            },
            // メモの追加。$store.commitを使い、memoストアのinsertを実行する。引数にはメモのtitleとcontent
            insert: function () {
                this.$store.commit('memo/insert',
                    {title: this.title, content: this.content});
                this.title = '';
                this.content = '';
            },
            // 項目を選択し、その内容をフォームに表示する処理。flgを変えて、titleやcontentに代入するだけ。
            select: function (item) {
                this.find_flg = false;
                this.sel_flg = item;
                this.title = item.title;
                this.content = item.content;
            },
            // メモの削除。flgをチェックして実行する。
            // 実際の削除処理は、$store.commitでmemoストアのremoveを実行するだけ。引数にset_flgを渡す。
            // メモが選択されているときは、このset_flgに選択したメモオブジェクトが入っているので、それをremoveにわたす。
            // 最後にset_flgを呼び出して元の状態に(選択されていない状態)に戻す。
            remove: function () {
                if (this.sel_flg == false) {
                    return;
                } else {
                    this.$store.commit('memo/remove', this.sel_flg);
                    this.set_flg();
                }
            },
            // 検索を実行。
            find: function () {
                this.sel_flg = false;
                this.find_flg = true;
            },
            // nextとprevは、前後移動の処理。pageの値を１増やしたり減らしたりしている。
            next: function () {
                this.page++;
            },
            prev: function () {
                this.page--;
            },
        },
        // コンポーネントが生成されるとき（このページにアクセスしたとき）に実行する処理。
        // $store.commitを使い、memoストアのset_pageを呼び出して、表示ページをゼロにしている。
        // ストアに値は、ローカルストレージに保存されるから、次にアクセスしたときには最後に表示していたページが表示されるようになります。
        // それでもいいけど、一応、最初のページに戻るようにしておく
        created: function () {
            this.$store.commit('memo/set_page', 0);
        },
    }
</script>

<style>
  .container {
    padding: 5px 10px;
  }

  h1 {
    font-size: 60pt;
    color: #345980;
  }

  p {
    padding-top: 5px;
    font-size: 20pt;
  }

  div {
    font-size: 14pt;
  }

  pre {
    padding: 10px;
    font-size: 18pt;
    background-color: #efefef;
  }

  input {
    font-size: 14pt;
    margin: 5px;
  }

  textarea {
    font-size: 14pt;
    margin: 5px;
  }

  button {
    font-size: 14pt;
    padding: 1px 10px;
    margin: 5px;
  }

  hr {
    border-style: none;
    border-top: solid;
    border-width: 5px;
    border-color: #def;
    margin: 20px 0px 10px 0px;
  }

  li {
    font-size: 14pt;
    height: 32px;
  }

  th {
    background-color: #345980;
    color: white;
  }

  td {
    background-color: aliceblue;
    color: #345980;
    padding: 5px;
  }

  .nav {
    padding: 0px 10px;


    cursor: pointer;
  }

  .list {
    cursor: pointer;
  }

  /*トランジション*/
  .del-enter-active, .del-leave-active {
    transition: opacity .5s;
  }

  .del-enter, .del-leave-to {
    opacity: 0;
  }
</style>
