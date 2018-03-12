const routers = [
    {
        path: '/',
        component: require('./components/home'),
    },
    {
        path: '/users',
        component: require('./components/users'),
    },
    {
        path: '/novel',
        component: require('./components/novel'),
    }
]

module.exports = (app) => {
    routers.forEach((router) => {
        app.use(router.path, router.component)
    });
};
