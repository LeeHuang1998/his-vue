<template>
    <div v-if="proxy.$isAuth(['ROOT', 'GOODS:SELECT'])">
        <!-- 搜索表单 -->
        <el-form :inline="true" :model="searchBannerForm" :rules="searchBannerForm.searchBannerRules"
            ref="searchBannerFormRef">
            <el-form-item prop="keyword">
                <el-input v-model="searchBannerForm.keyword" class="input" placeholder="请输入商品名称" clearable></el-input>
            </el-form-item>
            <el-form-item prop="goodsId">
                <el-input v-model="searchBannerForm.goodsId" class="input" placeholder="请输入商品id" clearable></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="searchBannerHandle"
                    :disabled="!proxy.$isAuth(['ROOT', 'GOODS:SELECT'])">查询</el-button>
                <el-button type="primary" @click="insertBannerHandle"
                    :disabled="!proxy.$isAuth(['ROOT', 'GOODS:INSERT'])">新增</el-button>
                <el-tooltip effect="dark" content="只有未发布的轮播图才可以删除" trigger="hover" :hide-after="0"
                    placement="bottom-start">
                    <el-button type="danger" @click="deleteBannerHandle(undefined)"
                        :disabled="!proxy.$isAuth(['ROOT', 'GOODS:DELETE'])">批量删除</el-button>
                </el-tooltip>
            </el-form-item>
            <el-form-item class="mold">
                <el-radio-group v-model="searchBannerForm.statusLabel" @change="searchBannerHandle()">
                    <el-radio-button label="全部" value="全部" />
                    <el-radio-button label="已发布" value="已发布" />
                    <el-radio-button label="未发布" value="未发布" />
                </el-radio-group>
            </el-form-item>
        </el-form>

        <!-- 数据表格 -->
        <el-table :data="bannerTable.bannerList" :header-cell-style="{ 'background-color': '#f5f7fa' }" border stripe
            v-loading="bannerTable.loading" @selection-change="selectionChangeHandle">
            <el-table-column type="selection" header-align="center" align="center" width="50"
                :selectable="selectable" />
            <el-table-column label="序号" header-align="center" align="center" width="80">
                <template #default="scope">
                    {{ (bannerTable.pageIndex - 1) * bannerTable.pageSize + scope.$index + 1 }}
                </template>
            </el-table-column>
            <el-table-column label="轮播图名称" prop="name" header-align="center" align="center"
                :show-overflow-tooltip="true" min-width="280"></el-table-column>
            <el-table-column label="套餐id" prop="goodsId" header-align="center" align="center"
                min-width="80"></el-table-column>
            <el-table-column label="套餐名称" prop="title" header-align="center" align="center"
                :show-overflow-tooltip="true" min-width="280"></el-table-column>
            <el-table-column label="套餐是否上架" prop="goodsStatus" header-align="center" align="center" min-width="100">
                <template #default="scope">
                    <span :class="scope.row.goodsStatus === true ? 'status-blue' : 'status-red'">
                        {{
                            scope.row.goodsStatus === true ? '已上架' : scope.row.goodsStatus === false ? '未上架' : '该商品不存在'
                        }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column label="备注" prop="remarks" header-align="center" align="center"
                :show-overflow-tooltip="true" min-width="280"></el-table-column>
            <el-table-column label="套餐网页地址" header-align="center" align="center" min-width="100">
                <template #default="scope">
                    <!-- 只有商品上架才可以预览 -->
                    <el-button type="primary"
                        :disabled="scope.row.goodsStatus == null || scope.row.goodsStatus == false" link
                        @click="goodsViewHandle(scope.row.goodsId)">查看网页</el-button>
                </template>
            </el-table-column>

            <el-table-column prop="status" label="状态" header-align="center" align="center" min-width="80">
                <template #default="scope">
                    <!-- el-tooltip：文字提示，当 hasCheckup 为 false 时有文字提示 -->
                    <el-tooltip effect="dark" :content="enableCount < 5 ? '商品上架后才能发布轮播图' : '最多只能发布 5 个轮播图'"
                        trigger="hover" :hide-after="0" placement="bottom-start" :disabled="scope.row.status === true">
                        <el-switch v-model="scope.row.status" inline-prompt
                            :disabled="!scope.row.goodsStatus || (scope.row.status === false && enableCount >= 5)"
                            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" active-text="已发布"
                            inactive-text="未发布" @change="switchStatusHandle(scope.row.id, scope.row.status)" />
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column label="操作" header-align="center" align="center" width="150">
                <template #default="scope">
                    <!-- 只有商品上架才可以预览 -->
                    <el-tooltip effect="dark" content="商品上架后才能预览" trigger="hover" :hide-after="0"
                        :disabled="scope.row.goodsStatus">
                        <el-button type="primary" link @click="bannerViewHandle(scope.row.id)"
                            :disabled="!scope.row.goodsStatus">预览</el-button>
                    </el-tooltip>
                    <el-tooltip effect="dark" content="轮播图未发布时才能修改" trigger="hover" :hide-after="0"
                        :disabled="!scope.row.status">
                        <el-button type="primary" link v-if="proxy.$isAuth(['ROOT', 'GOODS:UPDATE'])"
                            :disabled="scope.row.status" @click="updateBannerHandle(scope.row.id)">修改</el-button>
                    </el-tooltip>
                    <el-tooltip effect="dark" content="轮播图未发布时才能删除" trigger="hover" :hide-after="0"
                        :disabled="!scope.row.status === true">
                        <el-button type="primary" link v-if="proxy.$isAuth(['ROOT', 'GOODS:DELETE'])"
                            :disabled="scope.row.status === true"
                            @click="deleteBannerHandle(scope.row.id)">删除</el-button>
                    </el-tooltip>
                </template>
            </el-table-column>
        </el-table>

        <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
            :current-page="bannerTable.pageIndex" :page-sizes="[10, 20, 50]" :page-size="bannerTable.pageSize"
            :total="bannerTable.totalCount" layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
    </div>

    <!-- 轮播图预览弹窗 -->
    <el-dialog title="轮播图预览" v-model="bannerViewDialog.visible" width="50%" class="banner-dialog">
        <img :src="bannerViewDialog.image" alt="" style="width: 100%; height: 100%;">
        <template #footer>
            <el-button type="primary" size="large" @click="updateBannerHandle(bannerViewDialog.id)">修改</el-button>
            <el-button type="danger" size="large" @click="bannerViewDialog.visible = false">确定</el-button>
        </template>
    </el-dialog>

    <!-- 新增修改弹窗 -->
    <el-dialog v-if="proxy.$isAuth(['ROOT', 'GOODS:INSERT', 'GOODS:UPDATE'])" v-model="bannerDialogForm.visible"
        :title="bannerDialogForm.dataForm.id ? '修改' : '新增'" width="600px" :close-on-click-modal="false" draggable
        overflow :close-on-press-escape="true" class="banner-dialog" :teleported="false">
        <el-form :model="bannerDialogForm.dataForm" :rules="bannerDialogForm.dataRules" ref="bannerDialogFormRef"
            label-width="100px">
            <el-form-item prop="name" label="轮播图名称">
                <el-input v-model="bannerDialogForm.dataForm.name" placeholder="请输入轮播图名称" clearable></el-input>
            </el-form-item>
            <el-form-item prop="goodsId" label="套餐 id">
                <el-input v-model="bannerDialogForm.dataForm.goodsId" placeholder="请输入套餐id" clearable></el-input>
            </el-form-item>
            <el-form-item prop="remarks" label="套餐简介">
                <el-input type="textarea" v-model="bannerDialogForm.dataForm.remarks" placeholder="请输入备注" :rows="3"
                    clearable></el-input>
            </el-form-item>
            <el-form-item label="封面图片" prop="image">
                <!-- 回显图片和上传图片按钮 -->
                <div class="image-uploader-wrapper">
                    <el-upload v-if="!bannerDialogForm.dataForm.image" class="image-uploader" action=""
                        :auto-upload="false" :show-file-list="false" accept=".jpg,.jpeg,.png" :on-change="handleChange"
                        :before-upload="beforeImageUpload">
                        <!-- 未选图 -->
                        <el-icon class="image-uploader-icon">
                            <Plus />
                        </el-icon>
                        <!-- 已选 / 回显 -->
                    </el-upload>
                    <div class="uploaded-image" v-else>
                        <img :src="bannerDialogForm.dataForm.image" class="uploaded-image" />
                        <div class="delete-btn" @click="bannerDialogForm.dataForm.image = ''">
                            <el-icon>
                                <Close />
                            </el-icon>
                        </div>
                    </div>
                </div>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" @click="bannerDialogForm.visible = false">取消</el-button>
                <el-button type="primary" @click="bannerDialogFormSubmit">确定提交</el-button>
            </span>
        </template>
    </el-dialog>

</template>

<script lang="ts" setup>
import { ref, getCurrentInstance, computed } from 'vue'
import { ElMessage, ElMessageBox, type UploadFile, type UploadRawFile } from 'element-plus'

import router from '../../router'

const { proxy } = getCurrentInstance() as any

// 搜索表单
const searchBannerForm = ref({
    keyword: null,
    goodsId: null,
    statusLabel: '全部',                        // 轮播图状态 标签
    status: null,                               // 轮播图状态 值（发送到后端查询）
    searchBannerRules: {
        keyword: [
            { pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{1,50}$', message: '关键字内容不正确' }
        ],
        goodsId: [
            { pattern: '^[0-9]{1,10}$', message: '套餐 id 不正确', trigger: 'change' }
        ]
    }
})

// 轮播图表格
const bannerTable = ref({
    bannerList: [],
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    loading: false,
    isPublished: [],
    selections: [],
})

// 获取轮播图数据
const getBannerListHandle = () => {
    bannerTable.value.loading = true

    // 判断轮播图状态查询条件
    if (searchBannerForm.value.statusLabel == '全部') {
        searchBannerForm.value.status = null
    } else if (searchBannerForm.value.statusLabel == '已发布') {
        searchBannerForm.value.status = true
    } else {
        searchBannerForm.value.status = false
    }

    // 设置查询参数
    let searchParams = {
        keyword: searchBannerForm.value.keyword,
        status: searchBannerForm.value.status,
        goodsId: searchBannerForm.value.goodsId,

        page: bannerTable.value.pageIndex,
        length: bannerTable.value.pageSize
    }


    // 发送请求
    proxy.$http('/mis/banner/getBannerList', 'POST', searchParams, true, resp => {
        bannerTable.value.bannerList = resp.bannerPageData.pageList

        bannerTable.value.totalCount = resp.bannerPageData.totalCount
        bannerTable.value.loading = false

    })
}

// 搜索轮播图
const searchBannerHandle = () => {
    getBannerListHandle()
}

getBannerListHandle()

// 轮播图预览弹窗
const bannerViewDialog = ref({
    visible: false,
    id: null,                       // bannerID
    image: ''                      // banner 图片地址
})

// 新增修改弹窗
const bannerDialogForm = ref({
    visible: false,
    fileName: '',               // 被选择的文件名称
    path: '',                   // 被选择的文件 minio 存储路径
    dataForm: {
        id: null,
        goodsId: null,
        name: '',
        image: '',
        remarks: '',
    },
    dataRules: {
        name: [
            { required: true, message: '名称不能为空', trigger: 'blur' },
            { min: 2, message: '名称不能少于2个字符' },
            { pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{2,50}$', message: '名称格式错误' }
        ],
        goodsId: [
            { required: true, message: '请输入套餐ID', trigger: 'blur' },
            { pattern: /^(0|[1-9]\d*)$/, message: '套餐ID必须是大于等于 0 的整数', trigger: 'blur' },
            {
                validator: (rule, value, callback) => {
                    let result = bannerTable.value.bannerList.find(item => item.goodsId == value)

                    if (result != null && result.id !== bannerDialogForm.value.dataForm.id) {
                        return callback(new Error('该套餐ID已存在'));
                    }
                    callback();
                },
                trigger: 'blur'
            }
        ],
        image: [
            { required: true, message: '轮播图不能为空', trigger: 'blur' },
            {
                validator: (rule, value, callback) => {
                    // 检查是否为空
                    if (value.length === 0) {
                        return callback(new Error('上传图片不能为空'));
                    }
                    // 验证通过
                    callback();
                },
                trigger: 'change'  // 当数组变化时触发验证
            }
        ],
        remarks: [
            { max: 50, message: '描述不能超过 50 个字符' }
        ]
    }
})


// 复选框是否能被选中
const selectable = (row: any) => {
    if (row.status) {
        return false
    }
    return true;
}

// 复选框选择事件
const selectionChangeHandle = (val: any) => {
    bannerTable.value.selections = val
}

// 批量删除轮播图
const deleteBannerHandle = (id: number | undefined) => {
    let ids = id === undefined ? bannerTable.value.selections.map(item => item.id) : [id]

    ElMessageBox.confirm(
        '确定要删除选中的轮播图吗？',
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        // 发送请求删除
        proxy.$http('/mis/banner/deleteBanner', 'POST', { ids: ids }, true, resp => {
            ElMessage.success({
                message: '删除成功',
                duration: 1200
            })
            getBannerListHandle()
        })
    }).catch(() => {
        ElMessage.info({
            message: '取消删除',
            duration: 1200
        })
    })


}

// 轮播图预览
const bannerViewHandle = (id: number) => {
    bannerViewDialog.value.id = id
    bannerViewDialog.value.image = `${proxy.$minioUrl}` + '/' + bannerTable.value.bannerList.find(item => item.id == id).image
    bannerViewDialog.value.visible = true
}

// 新增轮播图按钮
const insertBannerHandle = () => {
    bannerDialogForm.value.visible = true
    bannerDialogForm.value.dataForm.id = null

    proxy.$nextTick(() => {
        proxy.$refs['bannerDialogFormRef'].resetFields();
        proxy.$refs['bannerDialogFormRef'].clearValidate();
    })
}

// 修改轮播图按钮
const updateBannerHandle = (id: number) => {
    bannerViewDialog.value.visible = false

    bannerDialogForm.value.dataForm.id = id

    // 发送请求查询
    proxy.$http('/mis/banner/getBannerById', 'POST', { id: id }, true, resp => {
        // 回显数据
        bannerDialogForm.value.dataForm.id = resp.banner.id
        bannerDialogForm.value.dataForm.name = resp.banner.name
        bannerDialogForm.value.dataForm.goodsId = resp.banner.goodsId
        bannerDialogForm.value.dataForm.remarks = resp.banner.remarks
        bannerDialogForm.value.path = resp.banner.image
        bannerDialogForm.value.dataForm.image = `${proxy.$minioUrl}` + '/' + resp.banner.image
    })

    bannerDialogForm.value.visible = true
}


// 上传图片前校验处理，参数为上传的文件
const beforeImageUpload = (uploadFile: UploadRawFile) => {
    let size = uploadFile.size / 1024 / 1024
    if (size > 2) {
        ElMessage.error({
            message: '上传图片大小不能超过 2MB',
            duration: 1000
        })
        return false
    }
    return true
}

// 本地文件选择后处理，参数为选择的文件
const handleChange = (uploadFile: UploadFile) => {
    bannerDialogForm.value.dataForm.image = ''
    // 校验体积和格式 
    const raw = uploadFile.raw!                     // uploadFile.raw 为上传的文件，! 表示非空断言，告诉编译器这里一定有值
    if (!beforeImageUpload(raw)) return             // 若校验不通过，则直接返回，不执行后续代码
    bannerDialogForm.value.fileName = raw.name      // 设置文件名

    // 本地回显
    // 创建 FileReader 对象读取文件内容，将文件内容读取为 base64 格式
    const reader = new FileReader()
    // 启动读取，转成 base64 字符串，可以直接在 <img src=""> 或 Vue 的 data() 里立刻预览而不用再发一次 HTTP 获取图片地址。
    reader.readAsDataURL(raw)
    // 读取完成后触发回调，该回调有一个事件参数，事件参数中的 target 指向 FileReader 实例本身，target.result 是 FileReader 读完后存放结果的地方，base64 字符串就在其中
    reader.onload = ({ target }) => {
        bannerDialogForm.value.dataForm.image = target!.result as string
    }
}

// 将 base64 转换成 blob 
function dataURItoBlob(dataURI: string) {
    // 1. 数组解构，把 data:image/jpeg;base64,/9j/4AAQ… 按第一个逗号分开为两部分，存放到数组中，然后将该数组中的两个元素分别赋值给 head，data
    const [head, data] = dataURI.split(',')

    // 2. 获取 data:image/jpeg;base64 中 ":" 后 ";" 前的所有字符，断言非空表示必定能匹配到，并取正则匹配结果数组里第一个元素，提取 image/jpeg
    const mime = head.match(/:(.*?);/)![1]

    // 3. 浏览器内置函数 base64 解码，得到原始二进制字符串。
    const bstr = atob(data)

    // 4. 新建 无符号 8 位数组，长度 = 字符数。
    let n = bstr.length
    // Uint8Array：浏览器原生的定型数组（TypedArray），数组长度声明时固定，不可变长，每个元素固定大小为 1 字节，是元素占位数最少的类型，并且数组中的每个元素的范围必须在 0-255 之内
    // 元素占位数最少：一个数组元素（一格）在内存里用的比特（bit）数量最少，比如一个字节（Byte）是 8 个比特，一个 16 位数组元素是 16 个比特，所以 8 个比特的数组元素占位数最少
    const u8arr = new Uint8Array(n)

    // 5. 把每个字符的 Unicode 码塞进数组，将字符串转换为字节流
    for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);

    // 6. 返回一个 Blob 对象，它表示一个不可变、原始数据的类文件对象，用于存储二进制数据
    // 两个参数：数据本体，必须是 ArrayBuffer、TypedArray、Blob、String 等之一；
    //          选项对象，type 指定 MIME 类型，告诉浏览器/后端这是 image/jpeg（决定请求头 Content-Type 和后缀）
    return new Blob([u8arr], { type: mime })
}

// 提交表单
const bannerDialogFormSubmit = () => {
    proxy.$refs['bannerDialogFormRef'].validate((valid: boolean) => {
        // 通过校验
        if (valid) {

            // 1. 获取当前的图片地址
            let imageUrl = bannerDialogForm.value.dataForm.image

            // 2 判断是 url 还是本地选择的图片，若为本地选择文件则需要转成 blob
            if (imageUrl.startsWith('data:')) {
                
                // 2.1 把 base64 转 Blob，从字符串变成二进制文件数据
                const blob = dataURItoBlob(bannerDialogForm.value.dataForm.image)

                // 2.2 创建 FormData 对象，用来构造 multipart/form-data 报文，把 Blob 和额外参数一起传给后端
                const fd = new FormData()
                fd.append('file', blob, bannerDialogForm.value.fileName)            // 文件

                if (bannerDialogForm.value.dataForm.id != null) {
                    fd.append('oldPath', bannerDialogForm.value.path)               // 旧图片路径，用于删除旧图片
                } else {
                    fd.append('oldPath', '')                                       // 新图片路径，用于删除旧图片
                }

                // 2.3 发送请求上传图片
                proxy.$upload('/mis/banner/uploadBanner', fd, false, resp => {
                    
                    // 3.1 成功后把后端返回的 url 写回表单
                    if (resp.path != null || resp.path != '') {
                        bannerDialogForm.value.path = resp.path
                    } else {
                        ElMessage.error({
                            message: resp.msg,
                            duration: 1000
                        })
                    }
                })
            }

            // 3.1 创建表单数据
            let bannerJson = {
                id: bannerDialogForm.value.dataForm.id,
                goodsId: bannerDialogForm.value.dataForm.goodsId,
                name: bannerDialogForm.value.dataForm.name,
                remarks: bannerDialogForm.value.dataForm.remarks,
                image: bannerDialogForm.value.path,
                status: false
            }

            // 3.2 发送请求
            proxy.$http(bannerJson.id ? '/mis/banner/updateBanner' : '/mis/banner/insertBanner', 'POST', bannerJson, true, resp => {
                if (resp.result == 1) {
                    ElMessage.success({
                        message: bannerJson.id ? '修改轮播图成功' : '新增轮播图成功',
                        duration: 1000
                    })
                    bannerDialogForm.value.visible = false
                    getBannerListHandle()
                } else {
                    ElMessage.error({
                        message: resp.msg,
                        duration: 1000
                    })
                }
            })
        }
    })
}

// 改变轮播图发布状态
const switchStatusHandle = (id: number, status: boolean) => {
    // 发送请求到后端，更新轮播图状态
    proxy.$http('/mis/banner/updateBannerStatus', 'POST', { id: id, status: status }, true, resp => {
        if (resp.result == 1) {
            ElMessage.success({
                message: '发布成功',
                duration: 1000,
            })
            searchBannerForm.value.statusLabel = '全部'
            getBannerListHandle()
        } else {
            ElMessage.error({
                message: resp.msg,
                duration: 1000
            })
        }
    })
}

// 获取已发布轮播图数量，超过 5 个时无法再发布更多轮播图
const enableCount = computed(() =>
    bannerTable.value.bannerList.filter((row: any) => row.status === true).length
)

// 网页预览
const goodsViewHandle = (id: number) => {
    router.push({
        name: 'FrontGoods',
        params: {
            id: id
        }
    })
}

// 选择每页数据条数
const sizeChangeHandle = (val: number) => {
    bannerTable.value.pageSize = val
    bannerTable.value.pageIndex = 1
    getBannerListHandle()
}

// 跳转页面
const currentChangeHandle = (val: number) => {
    bannerTable.value.pageIndex = val
    getBannerListHandle()
}

</script>

<style lang="less" scoped>
@import url("banner.less");

.uploaded-image {
    width: 455px;
    height: 100px;
    border-radius: 6px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .delete-btn {
        position: absolute;
        right: 5px;
        top: 5px;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #f56c6c;
        font-size: 14px;
    }
}

:global(.banner-dialog .el-dialog__footer) {
    padding-top: 0 !important;
    padding-bottom: 0px !important;
    margin-right: 10px !important;
}
</style>