const Handlebars = require('handlebars');
const moment = require('moment');

module.exports = {
    range: function (start, end, query, category, brand, min, max, rating) {
        let result = [];
        for (let i = start; i <= end; i++) {
            result.push({ i, query, category, brand, min, max, rating });
        }
        return result;
    },
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    eq: (a, b) => a == b,
    gt: (a, b) => a > b,
    lt: (a, b) => a < b,
    getImage: (images, index) => {
        return images && images[index] ? images[index] : '';
    },
    times: (n, options) => {
        let result = "";
        for (let i = 0; i < n; i++) {
            result += options.fn(i);
        }
        return result;
    },
    // formatDate: (date) => {
    //     return new Date(date).toLocaleString();
    // },
    formatRate: (rating) => {
        // Tạo chuỗi sao đầy
        const fullStars = '<i class="fa fa-star"></i>'.repeat(rating);
        // Tạo chuỗi sao rỗng (màu xám)
        const emptyStars = '<i class="fa fa-star-o" style="color: gray;"></i>'.repeat(5 - rating);
        return new Handlebars.SafeString(fullStars + emptyStars);
    },
    timeAgo: (date) => {
        return moment(date).fromNow();
    },
    formatDate: function (date) {
        if (!date) return "";
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(date).toLocaleDateString("en-US", options);
      },
    gridClass: function (length) {
        return length > 1 ? "grid grid-cols-2 gap-4" : "grid grid-cols-1 gap-4";
    },
};
