const router = require('express').Router();
const User = require('../model/user');
const bcrypt = require('bcrypt');
const md5 = require('md5');


// Kullanıcı Kayıt İşlemi
router.post('/signup', async (req, res) => {
    const { error, value } = User.signUpValidation(req.body);
    if (error) {
        res.send({ message: error.message });
    } else {
        const hash = await bcrypt.hash(value.password, 10); // hash işlemi
        value.password = hash;
        User.create({ name: value.name, email: value.email, password: value.password, sex: value.sex, about: value.about }).then((document) => {
            res.json({ message: true }); // Kullanıcı başarılı şekilde oluşturuldu.
        }).catch((error) => {
            res.send({ message: error.message });// kullanıcı oluşturulma işlemi başarısız.
        });
    }
});

// Kullanıcı Giriş İşlemi
router.post('/signin', async (req, res) => {
    User.findOne({ email: req.body.email }).then((document) => {
        if (document) { // Kullanıcı mevcut
            const hash = String(document.password);
            bcrypt.compare(req.body.password, hash).then((result) => {

                if (result) {
                    var token = createMD5(hash);
                    User.updateOne({ email: req.body.email }, { token: token }, (error, raw) => console.log(raw));
                    res.send({ message: result, token: token });
                } else {
                    res.send({ message: result });
                }
            });
        } else { // Aranan kullanıcı mevcut değil
            res.send({ message: 'Kullanıcı Bulunamadı' });
        }

    })
});

// Shuffle
router.post('/shuffle', (req, res) => {
    var token = req.body.token;
    User.aggregate([
        { $sample: { size: 10 } },
        {
            $match: {
                token: {
                    $nin: [token],
                }
            }
        }
    ], function (err, docs) {
        docs.forEach(e => {
            delete e.password
            delete e.token
            delete e.__v
        });
        res.send(docs);
    });
});

router.post('/userinfo', (req, res) => {
    let token = req.body.token;
    User.findOne({ token: token }, (err, document) => {
        res.send(document);
    });
});

function createMD5(data) {
    const dateSecond = new Date().getTime()
    const token = md5(dateSecond + data);
    return token;
}
module.exports = router;