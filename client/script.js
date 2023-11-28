document.addEventListener('DOMContentLoaded', function () {
  // HTML要素の取得
  const radiusInput = document.getElementById('radius'); // 検索半径の入力フィールド
  const restaurantList = document.getElementById('restaurant-list'); // レストランリストの表示エリア
  const paginationContainer = document.getElementById('pagination'); // ページネーションの表示エリア
  const resultRestaurant = document.getElementById('result-restaurant'); // 検索結果数の表示エリア

  let currentPosition = null; // 現在地を保存する変数

  // 全てのレストランデータを保存する変数
  let allRestaurants = [];
  // 1ページあたりのアイテム数
  const itemsPerPage = 10;
  // 現在のページ数
  let currentPage = 1;

  // Geolocation APIで現在地を取得する関数
  function getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          currentPosition = position.coords; // 現在地を保存
        },
        error => {
          console.error('Error getting current location: ', error.message);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser');
    }
  }

  // レストランを検索する関数
  window.searchRestaurants = async function () {
    if (!currentPosition) {
      alert('現在地を取得してください。');
      return;
    }

    const radius = radiusInput.value; // 検索半径
    const latitude = currentPosition.latitude; // 緯度
    const longitude = currentPosition.longitude; // 経度

    try {
      // 全てのレストランデータを保存
      allRestaurants = [];

      // ページ番号
      let start = 1;

      // 同時に実行するリクエストの数
      const concurrentRequests = 10;

      while (true) {
        // Promiseの配列を作成
        const promises = [];

        for (let i = 0; i < concurrentRequests; i++) {
          const url = `http://localhost:4000/data/?&lat=${latitude}&lng=${longitude}&range=${radius}&start=${start + i * 100}`;

          // fetchのPromiseを配列に追加
          promises.push(fetch(url).then(response => response.json()));
        }

        // Promise.allを使用してすべてのリクエストを並列に実行
        const results = await Promise.all(promises);

        // レスポンスを処理
        let allEmpty = true;
        for (const data of results) {
          if (data.results.shop.length !== 0) {
            allEmpty = false;
            // データを保存
            allRestaurants = allRestaurants.concat(data.results.shop);
          }
        }

        // すべてのレスポンスが空だった場合、ループを抜ける
        if (allEmpty) {
          break;
        }

        // 開始位置を更新
        start += 100 * concurrentRequests;
      }

      // ここでcurrentPageを1にリセット
      currentPage = 1;
      displayResults(currentPage); // 検索結果を表示
      addPagination(); // ページネーションを追加

      // 検索結果数を表示
      resultRestaurant.innerHTML = `${allRestaurants.length}件見つかりました`;
    } catch (error) {
      console.error('Error fetching restaurant data: ', error.message);
    }
  }

  // 検索結果を表示する関数
  function displayResults(pageNumber) {
    // restaurantListをクリア
    restaurantList.innerHTML = '';

    // 表示するデータの範囲を計算
    const start = (pageNumber - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    // 表示するデータを取得
    const restaurantsToDisplay = allRestaurants.slice(start, end);

    //console.log(restaurantsToDisplay);

    // 各店舗の情報を処理する
    restaurantsToDisplay.forEach(restaurant => {
      const item = document.createElement('div'); // 新しいdiv要素を作成
      item.classList.add('restaurant-item'); // div要素にクラスを追加

      // div要素の中身を設定
      item.innerHTML = `
            <img src="${restaurant.photo.pc.l}" alt="${restaurant.name}" width="40%" height="40%">
            <a href="http://localhost:4000/restaurant/${restaurant.id}" class="link-style-btn" onclick="saveRestaurantId('${restaurant.id}')"> <h3>${restaurant.name}</h3> </a>
            <p>${restaurant.access}</p>
              `;

      restaurantList.appendChild(item); // div要素をrestaurantListに追加
      addPagination(); // ページネーションを追加
    });

    // レストランIDを保存する関数
    window.saveRestaurantId = function (id) {
      sessionStorage.setItem('restaurantId', id);
    }
  }

  // ページングのHTMLを生成し、paginationContainerに追加する関数
  function addPagination() {
    // ページ数を計算
    const pageCount = Math.ceil(allRestaurants.length / itemsPerPage);

    // ページ数が1の場合は何も表示しない
    if (pageCount <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    // ページングのHTMLを生成
    let paginationHTML = '<div class="pagination">';
    if (currentPage !== 1) {
      paginationHTML += `<button onclick="goToPage(${currentPage - 1})">← Prev</button>`;
    }
    for (let i = 1; i <= pageCount; i++) {
      if (i === 1 || i === pageCount || (i >= currentPage - 1 && i <= currentPage + 1)) {
        if (i === currentPage) {
          paginationHTML += `<span class="active">${i}</span>`;
        } else {
          paginationHTML += `<button onclick="goToPage(${i})">${i}</button>`;
        }
      } else if (i === 2 || i === pageCount - 1) {
        paginationHTML += '...';
      }
    }
    if (currentPage !== pageCount) {
      paginationHTML += `<button onclick="goToPage(${currentPage + 1})">Next →</button>`;
    }
    paginationHTML += '</div>';

    // paginationContainerにHTMLを追加
    paginationContainer.innerHTML = paginationHTML;
  }

  // 特定のページに移動する関数
  window.goToPage = function (pageNumber) {
    currentPage = pageNumber;

    // 指定したページのデータを表示
    displayResults(currentPage);
  }

  // ここで getCurrentLocation を呼び出して初期化
  getCurrentLocation();
})