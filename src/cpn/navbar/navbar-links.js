const links = {
    su: {
        urls : [
            { id: 0, url: "/", label: "Trang chủ", icon: "home.png",},
            { id: 1, url: "/su/projects", label: "Quản lý dự án", icon: "manage.png" },
            { id: 2, url: "/su/users", label: "Quản lý người dùng", icon: "users.png" },
            { id: 3, url: "/statistic", label: "Thống kê", icon: "chart.png" },
            { id: 4, url: "/report/export", label: "Xuất báo cáo", icon: "export.png" },
        ],

        bottomUrls : [
            { id: 5, url: "/setting", label: "Cài đặt", icon: "settings.png" },
            { id: 6, url: "/help", label: "Trợ giúp", icon: "help.png" },
        ]
    },


    admin: {
        urls : [
            { id: 0, url: "/", label: "Trang chủ", icon: "home.png",},
            { id: 1, url: "/projects", label: "Quản lý dự án", icon: "manage.png" },
            { id: 2, url: "/plan", label: "Kế hoạch làm việc", icon: "plan.png" },
            { id: 7, url: "/design", label: "Thiết kế UI", icon: "design.png" },
            { id: 8, url: "/apis", label: "Thiết kế API", icon: "api.png" },
            { id: 3, url: "/statistic", label: "Thống kê", icon: "chart.png" },
            { id: 4, url: "/report/export", label: "Xuất báo cáo", icon: "export.png" },
        ],

        bottomUrls : [
            { id: 5, url: "/setting", label: "Cài đặt", icon: "settings.png" },
            { id: 6, url: "/help", label: "Trợ giúp", icon: "help.png" },
        ]
    },

    user: {
        urls : [
            { id: 0, url: "/", label: "Trang chủ", icon: "home.png",},
        ],

        bottomUrls : [
            { id: 6, url: "/help", label: "Trợ giúp", icon: "help.png" },
        ]
    }
}


export default links;
