# WebsiteBuilderTools
基于art-template模板引擎的前端网站开发构建小工具，开发支持实时热更新

## Demo
点击这里查看简单的Demo 
- [WebsiteBuilderTools Demo Home](http://htmlpreview.github.io/?https://github.com/qc-web-y/WebsiteBuilderTools/blob/master/dist/views/home.html)
- [WebsiteBuilderTools Demo About](http://htmlpreview.github.io/?https://github.com/qc-web-y/WebsiteBuilderTools/blob/master/dist/views/about.html)

> 1.请不要点击导航菜单，因为demo的路径是相对于站点路径的，如需正常查看demo，建议直接下载项目后运行

> 2.Demo是经过项目编译后的html代码，因此不是art模板哟！

## 使用指南
- 将项目下载保存到本地
- 使用 npm 安装依赖： `npm i`
- 项目开发测试运行： `npm run dev` （需要实时热更新运行：`npm run dev:hot`）
- 项目打包输出运行：`npm run build` 
- 开始编辑，.art文件语法请参考[art-template模板引擎官网文档](http://aui.github.io/art-template/zh-cn)

## 目录说明
```
> -- src // 开发目录
>   -- assets // 静态资源存放
>      -- images // 图片
>      -- scripts // javascript
>      -- styles // CSS、less、sass等样式
>   -- component  // art部分视图存放
>   -- data // 测试数据存放
>   -- views // art模板视图存放

> -- dist // 静态页面打包输出目录
> -- config // 配置目录
>   -- wbt.config.js // 主要配置文件
>   -- wbt.route.js // 路由配置文件
>   -- wbt.server.js // 开发测试服务器配置文件
>   -- gulp-art.js // gulp插件，用于编译art模板文件为html

> -- .gulpfile.js // gulp配置

> -- .gitignore
> -- package.json
> -- package-lock.json
> -- README.md
```

## 配置文档
> wbt.config.js （主要配置）

- artTemplate： [art-template](http://aui.github.io/art-template/zh-cn) 模板引擎选项配置，参考[官方文档](http://aui.github.io/art-template/zh-cn/docs/options.html)

- fileList： 文件清单，填写相对于`src`开发目录的路径，如：
```
 {
    art: 'views', // 表示 art 模板文件所在目录指向：src/views
    img: 'assets/images', // 表示图片文件所在目录指向：src/assets/images
}
```
- output： 输出配置
```
{
  file: path.join('dist') // 打包输出的文件路径，使用相对路径
}
```
- devServer： 开发服务配置
```
{
    host: 'localhost', 
    port: '8084'
}
```

> wbt.route.js （路由配置）

```
const shareData = require('../src/data/share');
const appMainRoute = [
	{
        // 路由路径
		path: '/',  
        // art模板文件名，默认查找wbt.config.js中设置的art文件指向目录中的art文件
		name: 'home', 
        // art模板使用数据，自行require
		data: shareData,
        // 输出art文件为html时重命名
		outRename: 'index'
	}
];
```




