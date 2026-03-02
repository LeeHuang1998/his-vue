// 引入 html2canvas 库，用于将 DOM 元素渲染为 canvas 图像
import html2Canvas from 'html2canvas';
// 引入 jsPDF 库，用于生成和下载 PDF 文件
import jsPDF from 'jspdf';

/**
 * 判断当前块元素与下一个块元素是否被 A4 页面边界“撕开”（即跨页）
 * @param nodes 所有需要分页判断的 DOM 元素数组
 * @param index 当前元素在数组中的索引
 * @param pageHeight 当前逻辑页的像素高度（根据 A4 比例动态计算）
 * @returns 如果当前块在本页结束、下一块在下一页开始，则返回 true
 */
function isSplit(nodes: Element[], index: number, pageHeight: number) {
    // 如果当前元素完全在本页内，且存在下一个元素
    if (
        nodes[index].offsetTop + nodes[index].offsetHeight < pageHeight &&
        nodes[index + 1] &&
        // 并且下一个元素的顶部已经超出当前页底部
        nodes[index + 1].offsetTop > pageHeight
    ) {
        return true;
    }
    return false;
}

/**
 * 全局挂载的 PDF 导出方法，用于将 #pdfDom 内容导出为 A4 格式的 PDF 文件
 * 调用方式：this.$getPdf() （需在 Vue 实例上下文中）
 */
export function getPdf() {
    // 获取要导出 PDF 的根 DOM 容器（id="pdfDom"）
    let imageWrapper = document.querySelector('#pdfDom'); // 获取DOM

    // 从 #pdfDom 元素的 name 属性中读取 PDF 文件名（如姓名）
    var title = imageWrapper.getAttribute('name'); //PDF标题

    // 保存当前页面的纵向滚动位置（兼容不同浏览器写法）
    let ST = document.documentElement.scrollTop || document.body.scrollTop;
    // 保存当前页面的横向滚动位置（兼容不同浏览器写法）
    let SL = document.documentElement.scrollLeft || document.body.scrollLeft;

    // 将页面滚动条重置到顶部（解决 el-dialog 内容超出视窗无法完整截图的问题）
    document.documentElement.scrollTop = 0;
    document.documentElement.scrollLeft = 0;
    document.body.scrollTop = 0;
    document.body.scrollLeft = 0;
    // 注：因为是 el-dialog 弹窗，内容较多时会出现滚动条，若不置顶，html2canvas 只能截取可视区域

    // 定义 A4 纸张的标准尺寸（单位：pt，在 72 DPI 下等价于像素）
    const A4_WIDTH = 592.28;   // A4 宽度（pt）
    const A4_HEIGHT = 841.89;  // A4 高度（pt）

    // 重新获取 DOM（确保是最新的）
    imageWrapper = document.querySelector('#pdfDom'); // 获取DOM
    // 再次读取 PDF 标题（防止前面未定义）
    title = imageWrapper.getAttribute('name'); //PDF标题

    // 根据 DOM 实际宽度，按 A4 宽高比动态计算每“逻辑页”的像素高度
    // 这样能保证内容按比例适配 A4 纸张
    let pageHeight = (imageWrapper.scrollWidth / A4_WIDTH) * A4_HEIGHT;

    // 这样 <h2>、<div.summary>、<table.checkup>、<div.desc> 都会被视为独立块进行分页判断
    let lableListID = Array.from(imageWrapper.children);

    // 遍历所有分页单元，检查是否需要插入分页占位符
    for (let i = 0; i < lableListID.length; i++) {
        // 计算当前块所在的“第几页”（向上取整）
        let multiple = Math.ceil((lableListID[i].offsetTop + lableListID[i].offsetHeight) / pageHeight);

        // 判断当前块与下一个块是否被页面边界“撕开”
        if (isSplit(lableListID, i, multiple * pageHeight)) {
            // 获取当前块的父容器（即 #pdfDom）
            let divParent = lableListID[i].parentNode as HTMLElement;

            // 创建一个新的空白 div 作为分页占位符
            let newNode = document.createElement('div');

            // 使用 Object.assign 强制设置内联样式，确保样式生效（无需外部 CSS）
            // 这样即使在 el-dialog 或复杂布局中，也能可靠撑开页面
            Object.assign(newNode.style, {
                display: 'block',               // 确保是块级元素
                width: '100%',                  // 占满父容器宽度
                minHeight: (multiple * pageHeight - (lableListID[i].offsetTop + lableListID[i].offsetHeight) + 30) + 'px',
                                                // 设置最小高度，确保把下一个块推到下一页
                                                // +30 是留白，避免紧贴边界
                height: 'auto',                 // 高度由 min-height 决定
                background: '#ffffff',          // 白色背景，避免透明干扰
                margin: '0',                    // 清除默认外边距
                padding: '0',                   // 清除默认内边距
                boxSizing: 'border-box',        // 盒模型包含 border 和 padding
                fontSize: '0',                  // 防止空格或换行符产生额外高度
                lineHeight: '0'                 // 行高设为 0，进一步压缩空白
            });

            // 获取当前块的下一个兄弟节点
            let next = lableListID[i].nextSibling;

            // 如果存在下一个兄弟节点，则将占位符插入到它前面
            if (next) {
                divParent.insertBefore(newNode, next);
            } else {
                // 否则追加到父容器末尾
                divParent.appendChild(newNode);
            }
        }
    }

    // 使用 Vue 的 $nextTick 确保 DOM 更新完成（如 .emptyDiv 已插入）后再执行截图
    this.$nextTick(() => {
        // nexttick可以保证要截图的部分全部执行完毕，具体用法自行百度...

        // 调用 html2canvas 对整个 #pdfDom 进行截图
        html2Canvas(imageWrapper, {
            allowTaint: true,           // 允许跨域图像污染 canvas（必要时）
            taintTest: false,           // 跳过污染测试（提升性能）
            useCORS: true,              // 尝试加载跨域图片（如二维码）
            dpi: window.devicePixelRatio * 4, // 提高分辨率（4倍设备像素比）
            scale: 4                    // 缩放级别，提高清晰度
        }).then(canvas => {
            // 创建一个新的 jsPDF 实例，A4 纸张，纵向（'p' 表示 portrait）
            let pdf = new jsPDF('p', 'mm', 'a4');

            // 获取 canvas 的 2D 上下文
            let ctx = canvas.getContext('2d');

            // 定义 A4 内容区尺寸（单位：mm），四边各留 10mm 边距
            let a4w = 190;  // 210 - 20 = 190mm
            let a4h = 277;  // 297 - 20 = 277mm

            // 根据 A4 宽高比，计算一页 PDF 对应的 canvas 像素高度
            let imgHeight = Math.floor((a4h * canvas.width) / a4w);

            // 已渲染的 canvas 高度（从顶部开始）
            let renderedHeight = 0;

            // 循环将长图分页绘制到 PDF 中
            while (renderedHeight < canvas.height) {
                // 创建一个临时 canvas 存储当前页的内容
                let page = document.createElement('canvas');
                page.width = canvas.width;
                // 当前页高度 = 剩余高度 和 单页高度 的较小值
                page.height = Math.min(imgHeight, canvas.height - renderedHeight);

                // 从原 canvas 中裁剪出当前页的图像数据，并绘制到临时 canvas
                page.getContext('2d').putImageData(
                    ctx.getImageData(
                        0,
                        renderedHeight,
                        canvas.width,
                        Math.min(imgHeight, canvas.height - renderedHeight)
                    ),
                    0,
                    0
                );

                // 将临时 canvas 转为 JPEG 图片，并添加到 PDF 页面中（保留 10mm 边距）
                pdf.addImage(
                    page.toDataURL('image/jpeg', 1.0), // 高质量 JPEG
                    'JPEG',
                    10, // x 坐标（左边距 10mm）
                    10, // y 坐标（上边距 10mm）
                    a4w, // 图片宽度（190mm）
                    Math.min(a4h, (a4w * page.height) / page.width) // 自适应高度
                );

                // 累加已渲染的高度
                renderedHeight += imgHeight;

                // 如果还有剩余内容未渲染，则添加新页
                if (renderedHeight < canvas.height) {
                    pdf.addPage();
                }
            }

            // 触发浏览器下载 PDF 文件，文件名为 #pdfDom 的 name 属性值
            pdf.save(`${title}.pdf`);
        });
    });
}