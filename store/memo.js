export const state = () => ({
  // メモを保管する配列
  memo: [],
  // 現在表示するページ番号を示すもの。ページ分けするために
  page: 0,
});

export const mutations = {
  // メモを追加する処理。objは送信されたフォームの値をまとめたオブジェクト
  insert: function (state, obj) {
    var d = new Date();
    var fmt = d.getFullYear() + '-' + (d.getMonth() + 1)
      + '-' + d.getDate() + ' ' + d.getHours() + ':'
      + d.getMinutes();
    state.memo.unshift({
      title: obj.title,
      content: obj.content,
      created: fmt
    });
  },
  // 引数に渡された番号をpageステートに設定するもの
  set_page: function (state, p) {
    state.page = p;
  },
  // メモデータの中から、引数に渡されたメモを削除する。
  remove: function (state, obj) {
    var num = 0;
    for (let i = 0; i < state.memo.length; i++) {
      const ob = state.memo[i];
      if (ob.title == obj.title
        && ob.content == obj.content
        && ob.created == obj.created) {
        alert('remove it! --' + ob.title);
        state.memo.splice(i, 1);
        return;
      }
    }
  },

}
