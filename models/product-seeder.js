var mongoose = require('mongoose');
var Product = require('../models/product');


var url = 'mongodb://Chabbe:XXXX@ds143754.mlab.com:43754/gamestore';
var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 60000 } }, 
                replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 60000 } } };
mongoose.connect(url,options);
// mongoose.createConnection(url, options);
var conn = mongoose.connection;
conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', function() {
var products = [ 
    new Product({
    imagePath: 'https://paarpsskoltidning.files.wordpress.com/2015/10/csgo4.jpg',
    title: 'CS:GO',
    description: 'Awesome fucking game!',
    price: 15
    }),
    new Product({
    imagePath: 'https://dvsgaming.org/wp-content/uploads/2015/06/World-Of-Warcraft-Logo2.jpg',
    title: 'World of Warcraft',
    description: 'Insane game!!',
    price: 20
    }),
    new Product({
    imagePath: 'http://mp1st.com/wp-content/uploads/2017/04/Call-of-Duty-WWII.jpg',
    title: 'Call of Duty',
    description: 'Crazy FPS!',
    price: 10
    }),
    new Product({
    imagePath: 'https://vice-images.vice.com/images/content-images-crops/2016/05/11/discussing-the-importance-of-doom-with-game-designer-dan-pinchbeck-doom-week-body-image-1462983105-size_1000.jpg?output-quality=75',
    title: 'DOOM',
    description: 'Classic cult fps-game!',
    price: 8
    }),
    new Product({
    imagePath: 'https://farm6.staticflickr.com/5624/23815901722_4d1edf4ed1_b.jpg',
    title: 'Uncharted 4',
    description: 'Adventoures third-person game!',
    price: 27
    }),
    new Product({
    imagePath: 'https://compass-ssl.xbox.com/assets/aa/07/aa07eaf5-f2e6-46a4-be25-5ec427842ed1.jpg?n=Xbox-One-S-GOW-4_Blade_1600x700.jpg',
    title: 'Gears of War 5',
    description: 'Crazy third-person shooter!',
    price: 20
    })
];  
    
    Product.insertMany(products, function (err, docs) {
      if (err) throw err;
      mongoose.connection.db.close(function(err) {
        if (err) throw err;
      });
    });
    
});
