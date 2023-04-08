let pageName = document.getElementById("pageName");
let root = document.getElementById("root");
let menu = document.getElementById("menu");
let cart = document.getElementById("cart");
let header = document.getElementById("header");

// KOLLA OM DET FINNS EN KUNDVAGN
if (localStorage.getItem("cart")) {
  console.log("Finns en kundvagn");
  printCart();
} else {
  console.log("Skapar tom kundvagn");
  let cart = [];
  localStorage.setItem("cart", JSON.stringify(cart));
  printCart();
}

//HÄMTA SIDANS TITEL OCH BESKRIVNING
fetch("http://164.90.234.180/wp-json")
  .then((res) => res.json())
  .then((data) => {
    console.log("data", data);
    pageName.innerText = data.name + " - " + data.description;
  })
  .catch((err) => console.log("err", err));
fetch("http://164.90.234.180/wp-json/wp/v2/media")
  .then((res) => res.json())
  .then((data) => {
    console.log(data);
    for (let index = 0; index < data.length; index++) {
      if (data[index].title.rendered == "moomin-bg") {
        header.style.backgroundImage =
          'url("' + data[index].guid.rendered + '")';
        console.log(data[index].link);
      }
    }
  });
//HÄMTAR MENY
fetch("http://164.90.234.180/wp-json/menus/v1/menus/headermeny")
  .then((res) => res.json())
  .then((data) => {
    console.log("posts", data);
    printPages(data);
  });

//HÄMTA PAGE CONTENT

function printContent(slug) {
  console.log(slug);
  fetch("http://164.90.234.180/wp-json/wp/v2/pages")
    .then((res) => res.json())
    .then((data) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].slug == slug) {
          console.log("GOT CONTENT!!: ", data[i].content.rendered);
          let content = data[i].content.rendered;
          return content;
        } else {
          console.log("404! Oj inget innehåll fanns här.");
        }
      }
    });
}
//LISTAR MENY
function printPages(pages) {
  let ul = document.createElement("ul");
  ul.id = "menu-list";
  pages.items.map((page) => {
    console.log("page", page.title);
    console.log("content:", page.content);
    let li = document.createElement("li");
    li.innerText = page.title;

    li.addEventListener("click", () => {
      wrapper.replaceChildren();

      //Butiks Page
      if (page.slug == "shop") {
        getProducts();
      }
      //Nyhets Page
      if (page.slug == "nyheter") {
        fetch("http://164.90.234.180/wp-json/wp/v2/posts")
          .then((res) => res.json())
          .then((data) => {
            for (let i = 0; i < data.length; i++) {
              let newsDiv = document.createElement("div");
              newsDiv.className = "news";
              let newsTitle = document.createElement("h2");
              let newsContent = document.createElement("div");
              newsTitle.innerText = data[i].title.rendered;
              newsContent.innerHTML = data[i].content.rendered;
              newsDiv.appendChild(newsTitle);
              newsDiv.appendChild(newsContent);
              wrapper.appendChild(newsDiv);
            }
          });
      }

      //Varukorgs PAGE
      if (page.slug == "varukorg") {
        fetch("http://164.90.234.180/wp-json/wc/v3/products")
          .then((res) => res.json())
          .then((data) => {
            let arr = JSON.parse(localStorage.getItem("cart"));
            //För reduce: Ta antalet och nyckelvärdet som parametrar
            const map = arr.reduce(
              (acc, e) => acc.set(e, (acc.get(e) || 0) + 1),
              new Map()
            );
            console.log("The array:");
            console.log(arr);
            let cartArr = [...map.entries()];
            let cartList = document.createElement("ul");
            console.info([...map.entries()]);
            console.log("mappa detta: " + [...map.entries()]);
            let total = 0;
            let price = 0;
            let totalDiv = document.createElement("div");
            for (let i = 0; i < cartArr.length; i++) {
              let itemDiv = document.createElement("div");
              let itemName = document.createElement("p");
              let itemQuantity = document.createElement("p");
              let priceBulk = document.createElement("p");
              let shopitem = document.createElement("li");
              let productImage = document.createElement("img");
              productImage.className = "cartimg";
              itemDiv.className = "itemdiv";
              for (let s = 0; s < data.length; s++) {
                if (cartArr[i][0] == data[s].id) {
                  productImage.src = data[s].images[0].src;
                  itemName.innerText = data[s].name;
                  price = data[s].price * cartArr[i][1];
                  total = total + price;
                  priceBulk.innerText = price + " KR";
                }
              }
              itemQuantity.innerText = cartArr[i][1] + " st";
              itemDiv.appendChild(productImage);
              itemDiv.appendChild(itemName);
              itemDiv.appendChild(priceBulk);
              itemDiv.appendChild(itemQuantity);

              shopitem.appendChild(itemDiv);
              shopitem.appendChild(totalDiv);
              cartList.appendChild(shopitem);
            }
            totalDiv.innerText = "Totalt: " + total + " kr";
            console.log("total kostnad:" + total);
            wrapper.appendChild(cartList);
            orderForm();
          });
      }
      if (page.slug == "om-oss") {
        fetch("http://164.90.234.180/wp-json/wp/v2/pages")
          .then((res) => res.json())
          .then((data) => {
            for (let i = 0; i < data.length; i++) {
              if (data[i].slug == page.slug) {
                console.log("GOT CONTENT!!: ", data[i].content.rendered);
                let content = data[i].content.rendered;
                wrapper.innerHTML = content;
              } else {
                console.log("404! Oj inget innehåll fanns här.");
              }
            }
          });
      }
    });
    ul.appendChild(li);
  });
  menu.appendChild(ul);
}
//HÄMTAR PRODUKTER
getProducts();

function getProducts() {
  fetch("http://164.90.234.180/wp-json/wc/store/products")
    .then((res) => res.json())
    .then((data) => {
      console.log("produkter", data);
      printProductList(data);
    });
}
//LISTAR PRODUKTER
function printProductList(products) {
  let ul = document.createElement("ul");
  ul.id = "productlist";

  products.map((product) => {
    let li = document.createElement("li");
    let productImg = document.createElement("img");
    let pCard = document.createElement("div");
    let addBtn = document.createElement("button");
    let pName = document.createElement("h3");
    let price = document.createElement("p");
    pCard.className = "card";
    pName.className = "productName";
    productImg.src = product.images[0].src;
    productImg.className = "productImg";
    pName.innerHTML = product.name;
    price.innerText = product.prices.price + product.prices.currency_suffix;
    addBtn.innerText = "Lägg i kundvagn";
    li.appendChild(pName);
    li.appendChild(pCard);
    pCard.appendChild(productImg);
    pCard.appendChild(price);
    pCard.appendChild(addBtn);

    addBtn.addEventListener("click", () => {
      console.log("Click på produkt", product.id);

      // HÄMTA
      let cart = JSON.parse(localStorage.getItem("cart"));
      console.log("cart från LS", cart);

      // ÄNDRA
      cart.push(product.id);

      // SPARA
      localStorage.setItem("cart", JSON.stringify(cart));
      printCart();
    });

    ul.appendChild(li);
  });
  wrapper.appendChild(ul);
}
//HANTERA KUNDVAGN
function printCart() {
  if (JSON.parse(localStorage.getItem("cart")).length > 0) {
    console.log("Finns produkter");
    cart.innerText =
      JSON.parse(localStorage.getItem("cart")).length + " st produkter";

    let emptyCartBtn = document.createElement("button");
    emptyCartBtn.id = "emptyBtn";
    emptyCartBtn.innerText = "Töm kundvagnen";

    emptyCartBtn.addEventListener("click", () => {
      localStorage.setItem("cart", JSON.stringify([]));
      printCart();
    });

    cart.append(emptyCartBtn);
  } else {
    console.log("Tom kundvagn");
    cart.innerText = "Inga produkter";
  }
}

function postOrder(
  fname,
  lName,
  adress,
  city,
  postcode,
  country,
  email,
  phone
) {
  console.log("Skicka order");

  fetch("http://164.90.234.180/wp-json/wc/v3/products")
    .then((res) => res.json())
    .then((data) => {
      let arr = JSON.parse(localStorage.getItem("cart"));
      //För reduce: Ta antalet och nyckelvärdet som parametrar
      const map = arr.reduce(
        (acc, e) => acc.set(e, (acc.get(e) || 0) + 1),
        new Map()
      );
      let cartArr = [...map.entries()];

      console.info([...map.entries()]);
      console.log("mappa detta: " + [...map.entries()]);
      let totalcost = 0;
      let price = 0;
      let line_itemsArr = [];
      let itemObj = {};
      for (let i = 0; i < cartArr.length; i++) {
        for (let s = 0; s < data.length; s++) {
          if (cartArr[i][0] == data[s].id) {
            price = data[s].price * cartArr[i][1];
            totalcost = totalcost + price;
            itemObj["product_id"] = cartArr[i];
            itemObj["quantity"] = cartArr[i][1];
            line_itemsArr.push(itemObj);
          }
        }
      }

      // SKAPA BODY
      let order = {
        payment_method: "bacs",
        payment_method_title: "Direct Bank Transfer",
        set_paid: true,
        billing: {
          first_name: fname,
          last_name: lName,
          adress_1: adress,
          city: city,
          postcode: postcode,
          country: country,
          email: email,
          phone: phone,
        },
        shipping: {
          first_name: fname,
          last_name: lName,
          adress_1: adress,
          city: city,
          postcode: postcode,
          country: country,
          email: email,
          phone: phone,
        },
        line_items: line_itemsArr,
        shipping_lines: [
          {
            method_id: "flat_rate",
            method_title: "Flat rate",
            total: totalcost.toString(),
          },
        ],
      };

      fetch("http://164.90.234.180/wp-json/wc/v3/orders", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(order),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Order skickad", data);
          localStorage.setItem("cart", JSON.stringify([]));
          printCart();
        })
        .catch((err) => console.log("err", err));
    });
}

function orderForm() {
  let form = document.createElement("form");
  let b_fName = document.createElement("input");
  b_fName.id = "b_fName";
  let b_lName = document.createElement("input");
  b_lName.id = "b_lastname";
  let b_adress = document.createElement("input");
  b_adress.id = "b_adress";
  let b_city = document.createElement("input");
  b_city.id = "b_city";
  let b_postcode = document.createElement("input");
  b_postcode.id = "b_postcode";
  let b_country = document.createElement("input");
  b_country.id = "b_country";
  let b_email = document.createElement("input");
  b_email.id = "b_email";
  let b_phone = document.createElement("input");
  b_phone.id = "b_phone";

  let b_fNameLbl = document.createElement("label");
  let b_lNameLbl = document.createElement("label");
  let b_adressLbl = document.createElement("label");
  let b_cityLbl = document.createElement("label");
  let b_postcodeLbl = document.createElement("label");
  let b_countryLbl = document.createElement("label");
  let b_emailLbl = document.createElement("label");
  let b_phoneLbl = document.createElement("label");

  let shipInfoBtn = document.createElement("button");
  shipInfoBtn.innerText = "Beställ";
  shipInfoBtn.className = "orderBtn";

  b_fNameLbl.innerText = "Förnamn: ";
  b_lNameLbl.innerText = "Efternamn: ";
  b_adressLbl.innerText = "Adress: ";
  b_cityLbl.innerText = "Stad/Ort: ";
  b_postcodeLbl.innerText = "Postnummer: ";
  b_countryLbl.innerText = "Land: ";
  b_emailLbl.innerText = "E-post: ";
  b_phoneLbl.innerText = "Telefon: ";

  form.appendChild(b_fNameLbl);
  form.appendChild(b_fName);
  form.appendChild(b_lNameLbl);
  form.appendChild(b_lName);
  form.appendChild(b_adressLbl);
  form.appendChild(b_adress);
  form.appendChild(b_cityLbl);
  form.appendChild(b_city);
  form.appendChild(b_postcodeLbl);
  form.appendChild(b_postcode);
  form.appendChild(b_countryLbl);
  form.appendChild(b_country);
  form.appendChild(b_emailLbl);
  form.appendChild(b_email);
  form.appendChild(b_phoneLbl);
  form.appendChild(b_phone);
  wrapper.appendChild(form);
  wrapper.appendChild(shipInfoBtn);

  shipInfoBtn.addEventListener("click", function () {
    let fname = document.getElementById("b_fName").value;
    let lName = document.getElementById("b_lastname").value;
    let adress = document.getElementById("b_adress").value;
    let city = document.getElementById("b_city").value;
    let postcode = document.getElementById("b_postcode").value;
    let country = document.getElementById("b_country").value;
    let email = document.getElementById("b_email").value;
    let phone = document.getElementById("b_phone").value;

    postOrder(fname, lName, adress, city, postcode, country, email, phone);
  });
}
