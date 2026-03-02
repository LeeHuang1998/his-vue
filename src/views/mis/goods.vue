<template>
    <div v-if="proxy.$isAuth(['ROOT', 'GOODS:SELECT'])">
        <!-- 搜索表单区域 -->
        <el-form :inline="true" :model="goodsSearchForm" :rules="goodsSearchForm.searchRules" ref="goodsSearchFormRef">
            <el-form-item prop="keyword">
                <el-input v-model="goodsSearchForm.keyword" class="input" placeholder="请输入套餐名称" clearable></el-input>
            </el-form-item>
            <el-form-item prop="code">
                <el-input v-model="goodsSearchForm.code" class="input" placeholder="请输入套餐编号" clearable></el-input>
            </el-form-item>
            <el-form-item>
                <el-select v-model="goodsSearchForm.type" class="input" placeholder="请选择套餐类型" clearable>
                    <el-option label="父母体检" value="父母体检"></el-option>
                    <el-option label="入职体检" value="入职体检"></el-option>
                    <el-option label="职场白领" value="职场白领"></el-option>
                    <el-option label="个人高端" value="个人高端"></el-option>
                    <el-option label="中青年体检" value="中青年体检"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-select v-model="goodsSearchForm.partId" class="input" placeholder="套餐分区" clearable>
                    <el-option label="活动专区" value="1"></el-option>
                    <el-option label="热卖套餐" value="2"></el-option>
                    <el-option label="新品推荐" value="3"></el-option>
                    <el-option label="孝敬父母" value="4"></el-option>
                    <el-option label="白领精英" value="5"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="searchGoodsHandle"
                    :disabled="!proxy.$isAuth(['ROOT', 'GOODS:SELECT'])">查询</el-button>
                <el-button type="primary" @click="insertGoodsHandle"
                    :disabled="!proxy.$isAuth(['ROOT', 'GOODS:INSERT'])">新增</el-button>
                <el-tooltip effect="dark" content="只有销量为 0 且未上架的套餐才可以删除" trigger="hover" :hide-after="0"
                    placement="bottom-start">
                    <el-button type="danger" @click="deleteGoodsHandle(undefined)"
                        :disabled="!proxy.$isAuth(['ROOT', 'GOODS:DELETE'])">批量删除</el-button>
                </el-tooltip>
            </el-form-item>
            <el-form-item class="mold">
                <el-radio-group v-model="goodsSearchForm.statusLabel" @change="searchGoodsHandle()">
                    <el-radio-button label="全部" value="全部" />
                    <el-radio-button label="已上架" value="已上架" />
                    <el-radio-button label="已下架" value="已下架" />
                </el-radio-group>
            </el-form-item>
        </el-form>

        <!-- 数据展示区域 -->
        <el-table :data="goodsTable.goodsDataList" :header-cell-style="{ 'background-color': '#f5f7fa' }" border stripe
            v-loading="goodsTable.loading" @selection-change="selectionChangeHandle">
            <el-table-column type="selection" header-align="center" align="center" width="50"
                :selectable="selectable" />
            <el-table-column label="序号" header-align="center" align="center" width="100">
                <template #default="scope">
                    {{ (goodsTable.pageIndex - 1) * goodsTable.pageSize + scope.$index + 1 }}
                </template>
            </el-table-column>
            <el-table-column label="套餐名称" prop="title" header-align="center" align="center"
                min-width="250"></el-table-column>
            <el-table-column label="套餐编号" prop="code" header-align="center" align="center"
                min-width="130"></el-table-column>
            <el-table-column label="现价" header-align="center" align="center" min-width="80">
                <template #default="scope">
                    ￥{{ scope.row.currentPrice }}
                </template>
            </el-table-column>
            <el-table-column label="原价" header-align="center" align="center" min-width="100">
                <template #default="scope">
                    ￥{{ scope.row.initialPrice }}
                </template>
            </el-table-column>
            <el-table-column prop="ruleName" label="促销方案" header-align="center" align="center"
                min-width="100"></el-table-column>
            <el-table-column prop="salesVolume" label="销量" header-align="center" align="center"
                min-width="100"></el-table-column>
            <el-table-column prop="type" label="类型" header-align="center" align="center"
                min-width="100"></el-table-column>
            <el-table-column label="体检内容" header-align="center" align="center" min-width="100">
                <template #default="scope">
                    <span :class="scope.row.hasCheckup ? 'link-blue' : 'link-red'"
                        @click="documentHandle(scope.row.id, scope.row.hasCheckup, scope)">
                        {{ scope.row.hasCheckup ? '查看文档' : '上传文档' }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" header-align="center" align="center" min-width="80">
                <template #default="scope">
                    <!-- el-tooltip：文字提示，当 hasCheckup 为 false 时有文字提示 -->
                    <el-tooltip effect="dark" content="必须上传文档后才能上架" trigger="hover" :hide-after="0"
                        :disabled="scope.row.hasCheckup" placement="bottom-start">
                        <el-switch v-model="scope.row.status" inline-prompt
                            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" active-text="已上架"
                            inactive-text="已下架" :disabled="!scope.row.hasCheckup"
                            @change="switchStatusHandle(scope.row.id, scope.row.status)" />
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column label="操作" header-align="center" align="center" width="150">
                <template #default="scope">
                    <!-- 只有商品上架才可以预览 -->
                    <el-button type="primary" link @click="goodsViewHandle(scope.row.id)"
                        :disabled="!scope.row.status">预览</el-button>
                    <el-button type="primary" link v-if="proxy.$isAuth(['ROOT', 'GOODS:UPDATE'])"
                        @click="updateGoodsHandle(scope.row.id)">修改</el-button>
                    <el-button type="primary" link v-if="proxy.$isAuth(['ROOT', 'GOODS:DELETE'])"
                        :disabled="scope.row.status == true || scope.row.salesVolume > 0"
                        @click="deleteGoodsHandle(scope.row.id)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
            :current-page="goodsTable.pageIndex" :page-sizes="[10, 20, 50]" :page-size="goodsTable.pageSize"
            :total="goodsTable.totalCount" layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>

    </div>

    <!-- 弹窗表单 -->
    <el-dialog v-if="proxy.$isAuth(['ROOT', 'GOODS:INSERT', 'GOODS:UPDATE'])" v-model="goodsDialogForm.visible"
        :title="goodsDialogForm.dataForm.id ? '修改' : '新增'" width="770px" :close-on-click-modal="false" draggable
        overflow :close-on-press-escape="false">
        <el-form :model="goodsDialogForm.dataForm" :rules="goodsDialogForm.dataRules" ref="goodsDialogFormRef"
            label-width="80px">
            <el-form-item prop="title" label="套餐名称">
                <el-input v-model="goodsDialogForm.dataForm.title" placeholder="请输入套餐名称" clearable></el-input>
            </el-form-item>
            <el-form-item prop="code" label="套餐编号">
                <el-input v-model="goodsDialogForm.dataForm.code" placeholder="请输入套餐编号" clearable></el-input>
            </el-form-item>
            <el-form-item prop="description" label="套餐简介">
                <el-input type="textarea" autosize v-model="goodsDialogForm.dataForm.description" placeholder="请输入套餐简介"
                    clearable></el-input>
            </el-form-item>
            <el-form-item prop="initialPrice" label="套餐原价">
                <el-input class="price" autosize v-model="goodsDialogForm.dataForm.initialPrice" placeholder="请输入原价"
                    clearable>
                    <template #prepend>￥</template>
                    <template #append>元</template>
                </el-input>
                <span class="desc">提示：价格精确到分（小数点后两位）</span>
            </el-form-item>
            <el-form-item prop="currentPrice" label="套餐现价">
                <el-input class="price" autosize v-model="goodsDialogForm.dataForm.currentPrice" placeholder="请输入现价"
                    clearable>
                    <template #prepend>￥</template>
                    <template #append>元</template>
                </el-input>
                <span class="desc">提示：价格精确到分（小数点后两位）</span>
            </el-form-item>
            <el-form-item label="折扣列表">
                <el-select class="input" v-model="goodsDialogForm.dataForm.ruleId" placeholder="请选择折扣方案" clearable>
                    <el-option v-for="rule in goodsDialogForm.rulesList" :label="rule.name"
                        :value="rule.id"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="封面图片" prop="image">
                <!-- 回显图片和上传图片按钮 -->
                <div class="image-uploader-wrapper">
                    <!-- 已上传的图片 -->
                    <div class="uploaded-images">
                        <div v-for="(image, index) in goodsDialogForm.imageUrlArr" :key="index"
                            class="uploaded-image-item">
                            <img :src="image" :alt="'上传图片 ' + (index + 1)" class="image">
                            <div class="delete-btn" @click="removeImage(index)">
                                <el-icon>
                                    <Close />
                                </el-icon>
                            </div>
                        </div>
                    </div>

                    <!-- 上传组件 action：上传地址   headers：请求头     data：上传时携带的数据 -->
                    <el-upload v-if="goodsDialogForm.imageUrlArr.length < 5" class="image-uploader"
                        :data="goodsDialogForm.upload.data" :action="goodsDialogForm.upload.action"
                        :show-file-list="false" accept=".jpg, .jpeg" :headers="goodsDialogForm.upload.headers"
                        :on-success="imageUploadSuccess" :before-upload="beforeImageUpload"
                        :on-error="imageUploadError">
                        <el-icon class="image-uploader-icon">
                            <Plus />
                        </el-icon>
                    </el-upload>
                </div>
            </el-form-item>
            <el-form-item label="套餐类别" prop="type">
                <el-select class="input" v-model="goodsDialogForm.dataForm.type" placeholder="请选择套餐类别" clearable>
                    <el-option label="父母体检" value="父母体检"></el-option>
                    <el-option label="入职体检" value="入职体检"></el-option>
                    <el-option label="职场白领" value="职场白领"></el-option>
                    <el-option label="个人高端" value="个人高端"></el-option>
                    <el-option label="中青年体检" value="中青年体检"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="特征标签">
                <div class="tag-row">
                    <el-input class="tag-input" v-model="goodsDialogForm.newTag" @keyup.enter="enterTag"
                        placeholder="请输入标签" clearable></el-input>
                    <span class="desc">提示：输入标签后回车</span>
                </div>
                <div class="tags">
                    <!-- closable：标签可删除   :disable-transitions：删除时是否有过渡动画 -->
                    <el-tag v-for="tag in goodsDialogForm.dataForm.tags" closable :disable-transitions="false"
                        @close="closeTagHandle(tag)">
                        {{ tag }}
                    </el-tag>
                </div>
            </el-form-item>
            <el-form-item label="套餐分区" prop="partId">
                <el-select class="input" v-model="goodsDialogForm.dataForm.partId" placeholder="请选择套餐分区" clearable>
                    <el-option label="活动专区" value="1"></el-option>
                    <el-option label="热卖套餐" value="2"></el-option>
                    <el-option label="新品推荐" value="3"></el-option>
                    <el-option label="孝敬父母" value="4"></el-option>
                    <el-option label="白领精英" value="5"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="体检内容">
                <!-- Layout 栅格分栏布局，共有 24 分栏，组件默认使用 Flex 布局  :gutter：指定列之间的间距   :span：该元素占用的栏数 -->
                <!-- 数据库中查出的体检内容 -->
                <el-row :gutter="10" class="item-row" v-for="(item, $index) in goodsDialogForm.goodsItems"
                    :key="$index">
                    <!-- 新增体检内容 -->
                    <el-col :span="6">
                        <el-select v-model="item.type" placeholder="检查类别" clearable>
                            <el-option label="科室检查" value="科室检查"></el-option>
                            <el-option label="实验室检查" value="实验室检查"></el-option>
                            <el-option label="医技检查" value="医技检查"></el-option>
                            <el-option label="其他检查" value="其他检查"></el-option>
                        </el-select>
                    </el-col>
                    <el-col :span="6">
                        <el-input v-model="item.title" placeholder="检查项目" maxlength="50" clearable></el-input>
                    </el-col>
                    <el-col :span="11">
                        <el-input v-model="item.content" placeholder="检查内容" maxlength="500" clearable></el-input>
                    </el-col>
                    <el-col :span="1">
                        <el-button type="danger" :icon="Delete" @click="deleteGoodsItemsHandle($index)"></el-button>
                    </el-col>
                </el-row>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="danger" @click="insertGoodsItemsHandle">添加项目</el-button>
                <el-button type="primary" @click="closeGoodsDialog">取消</el-button>
                <el-button type="primary" @click="goodsDialogFormSubmit">确定提交</el-button>
            </span>
        </template>
    </el-dialog>

    <!-- 上传下载弹窗 -->
    <el-dialog title="提示信息" v-if="proxy.$isAuth(['ROOT', 'GOODS:INSERT', 'GOODS:UPDATE'])"
        v-model="documentDialog.visible" width="350px">
        <div class="message-content">
            <el-icon :size="18" class="icon">
                <WarningFilled />
            </el-icon>
            <p>请选择【上传】或者【下载】体检内容文档。如果未上传体检内容文档，则体检套餐将无法上架。</p>
        </div>
        <template #footer>
            <span class="document-dialog-footer">
                <el-upload :action="documentDialog.upload.action" :data="documentDialog.data" :show-file-list="false"
                    :headers="documentDialog.upload.headers" accept=".xlsx" :before-upload="beforeDocumentUpload"
                    :on-success="documentUploadSuccess" :on-error="documentUploadError">
                    <el-button type="success" :icon="Upload" class="uploadBtn">上传</el-button>
                </el-upload>
                <el-button type="primary" :icon="Download" class="downloadBtn"
                    :disabled="!documentDialog.data.hasCheckup" @click="documentDownloadHandle">
                    下载
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref, getCurrentInstance, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type UploadFile, type UploadFiles, type UploadRawFile } from 'element-plus'
import { Delete, Download, Upload, WarningFilled } from '@element-plus/icons-vue';
import { cookieUtil } from '../../utils/CookieUtil';

import router from '../../router';

const { proxy } = getCurrentInstance() as any

// 搜索表单数据
const goodsSearchForm = ref({
    keyword: null,                              // 套餐名称搜索关键字
    code: null,                                 // 套餐编码
    type: null,                                 // 套餐类型
    partId: null,                               // 套餐分区 id
    statusLabel: '全部',                        // 套餐状态 标签
    status: null,                               // 套餐状态
    searchRules: {
        keyword: [
            { pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{1,50}$', message: '关键字内容不正确' }
        ],
        code: [
            { min: 6, message: '编号不能少于6个字符' },
            { pattern: '^[a-zA-Z0-9]{6,20}$', message: '编号格式错误' }
        ]
    }
})

// 数据表格
const goodsTable = ref({
    goodsDataList: [],
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    loading: false,
    selections: [],
})

// 加载页面数据
const getGoodsList = (pageIndex?: number) => {
    goodsTable.value.loading = true

    // 判断查询商品的状态
    if (goodsSearchForm.value.statusLabel === '全部') {
        goodsSearchForm.value.status = null
    } else if (goodsSearchForm.value.statusLabel === '已上架') {
        goodsSearchForm.value.status = true
    } else {
        goodsSearchForm.value.status = false
    }


    // 查询参数
    let searchParams = {
        keyword: goodsSearchForm.value.keyword,
        code: goodsSearchForm.value.code,
        type: goodsSearchForm.value.type,
        partId: goodsSearchForm.value.partId,
        status: goodsSearchForm.value.status,

        page: pageIndex != undefined ? pageIndex : goodsTable.value.pageIndex,
        length: goodsTable.value.pageSize
    }

    proxy.$http('/mis/goods/getGoodsListByPage', 'POST', searchParams, true, resp => {
        if (resp.code == 200) {
            goodsTable.value.totalCount = resp.pageData.totalCount
            goodsTable.value.goodsDataList = resp.pageData.pageList
            goodsTable.value.loading = false
        } else {
            ElMessageBox.confirm('获取商品列表失败，请刷新重试', '错误', {
                confirmButtonText: '确定',
                type: 'error'
            }).then(() => {
                getGoodsList()
            })
        }
    })
}

onMounted(() => {
    getGoodsList();
})

// 搜索
const searchGoodsHandle = () => {
    proxy.$refs['goodsSearchFormRef'].validate((valid: boolean) => {
        if (valid) {
            getGoodsList();
        } else {
            ElMessage.error({
                message: '请输入正确的搜索条件',
                duration: 1200,
            })
        }
    })
}

// 改变页码
const currentChangeHandle = (val: number) => {
    goodsTable.value.pageIndex = val
    getGoodsList()
}

// 改变每页数据量
const sizeChangeHandle = (val: number) => {
    goodsTable.value.pageIndex = 1
    goodsTable.value.pageSize = val
    getGoodsList()
}

// 上架下架处理
const switchStatusHandle = (id: number, status: boolean) => {
    proxy.$http('/mis/goods/updateGoodsStatus', 'POST', { id: id, status: status }, true, resp => {
        if (resp.rows == 1) {
            ElMessage.success({
                message: status ? '上架成功' : '下架成功',
                duration: 1200,

            })
            getGoodsList(goodsTable.value.pageIndex)
        }
    })
}


// 弹窗表单数据
const goodsDialogForm = ref({
    visible: false,
    newTag: null,
    goodsItems: [{}],                               // 体检内容
    imageUrlArr: [],                                // 上传图片地址
    removeImgUrlArr: [],                            // 删除图片地址
    checkup: null,                                  // 所有的检查项目合并的 JSON 数组对象
    rulesList: [],                                  // 套餐分区数组
    dataForm: {
        id: null,                                   // 套餐 id
        title: null,                                // 套餐名称
        code: null,                                 // 套餐编码
        description: null,                          // 套餐描述
        currentPrice: null,                         // 套餐现价
        initialPrice: null,                         // 套餐原价
        ruleId: null,                               // 折扣方案 id
        images: [],                                  // 套餐图片保存的路径（保存到数据库）
        type: null,                                 // 套餐类型
        partId: null,                               // 套餐分区 id
        tags: []                                    // 套餐标签
    },
    upload: {
        action: `${proxy.$baseUrl}/mis/goods/uploadImage`,              // 上传地址
        headers: {                                                      // 设置上传的请求头部
            token: cookieUtil.getBackendUser()?.token
        },
        data: {                                                         // 上传图片的套餐 id
            id: null
        }
    },
    dataRules: {
        title: [
            { required: true, message: '名称不能为空', trigger: 'blur' },
            { min: 2, message: '名称不能少于2个字符' },
            { pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{2,50}$', message: '名称格式错误' }
        ],
        code: [
            { required: true, message: '编号不能为空', trigger: 'blur' },
            { min: 6, message: '编号不能少于6个字符' },
            { pattern: '^[a-zA-Z0-9]{6,20}$', message: '编号格式错误' }
        ],
        description: [
            { required: true, message: '简介信息不能为空', trigger: 'blur' },
            { max: 200, message: '简介信息不能超过 200 个字符' },
        ],
        initialPrice: [
            {
                required: true,
                message: '价格不能为空',
                trigger: 'blur'
            },
            {
                pattern: '(^[1-9]([0-9]+)?(\\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\\.[0-9]([0-9])?$)',
                message: '价格不正确'
            }
        ],
        currentPrice: [
            {
                required: true,
                message: '价格不能为空',
                trigger: 'blur'
            },
            {
                pattern: '(^[1-9]([0-9]+)?(\\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\\.[0-9]([0-9])?$)',
                message: '价格不正确'
            }
        ],
        images: [
            {
                validator: (rule, value, callback) => {
                    // 检查是否为空
                    if (value.length === 0) {
                        return callback(new Error('请上传至少一张图片'));
                    }

                    // 检查长度是否超过5
                    if (value.length > 5) {
                        return callback(new Error('最多只能上传 5 张图片'));
                    }

                    // 验证通过
                    callback();
                },
                trigger: 'change'  // 当数组变化时触发验证
            }
        ],
        type: [
            {
                required: true,
                message: '没有选择套餐类别',
                trigger: 'blur'
            }
        ]
    }
})

// 新增按钮
const insertGoodsHandle = () => {

    // 清空表单数据
    goodsDialogForm.value.dataForm.id = null
    goodsDialogForm.value.dataForm.images = []
    goodsDialogForm.value.imageUrlArr = []

    // 清空规则列表数据
    goodsDialogForm.value.dataForm.ruleId = null
    goodsDialogForm.value.rulesList = []

    // 清空体检项目师数组
    goodsDialogForm.value.goodsItems = [{}]

    // 清空体检项目 JSON 对象
    goodsDialogForm.value.checkup = null

    // 清空 tag 数组对象
    goodsDialogForm.value.dataForm.tags = []
    goodsDialogForm.value.newTag = null

    goodsDialogForm.value.visible = true

    // 清空表单校验结果和其他表单项
    proxy.$nextTick(() => {
        proxy.$refs['goodsDialogFormRef'].resetFields()
        proxy.$refs['goodsDialogFormRef'].clearValidate()

        // 获取折扣方案
        proxy.$http('/mis/goods/getAllRules', 'GET', null, true, resp => {
            goodsDialogForm.value.rulesList = resp.ruleList
        })
    })
}

// 修改按钮
const updateGoodsHandle = (id: number) => {
    // 重置表单外的字段
    goodsDialogForm.value.visible = true
    goodsDialogForm.value.newTag = null
    goodsDialogForm.value.goodsItems = [{}]
    goodsDialogForm.value.imageUrlArr = []
    goodsDialogForm.value.checkup = null
    goodsDialogForm.value.rulesList = []
    goodsDialogForm.value.removeImgUrlArr = []

    // 表单内字段的值
    goodsDialogForm.value.dataForm.id = id
    goodsDialogForm.value.upload.data.id = id
    goodsDialogForm.value.dataForm.images = []
    goodsDialogForm.value.dataForm.tags = []

    proxy.$http('/mis/goods/getAllRules', 'GET', null, true, resp => {
        goodsDialogForm.value.rulesList = resp.ruleList
    })


    // 清空表单字段数据和校验结果并回显数据
    proxy.$nextTick(() => {
        proxy.$refs['goodsDialogFormRef'].clearValidate()
        // .resetFields() 只会重置表单中有 prop 属性的值重置，不会重置没有 prop 属性的值
        proxy.$refs['goodsDialogFormRef'].resetFields()

        // 发送请求到后端查询套餐信息
        proxy.$http('/mis/goods/getGoodsById', 'POST', { id: id }, true, resp => {
            // 回显套餐信息
            goodsDialogForm.value.dataForm.id = resp.goods.id
            goodsDialogForm.value.dataForm.title = resp.goods.title
            goodsDialogForm.value.dataForm.code = resp.goods.code
            goodsDialogForm.value.dataForm.description = resp.goods.description

            // 回显价格
            goodsDialogForm.value.dataForm.currentPrice = resp.goods.currentPrice.toFixed(2)
            goodsDialogForm.value.dataForm.initialPrice = resp.goods.initialPrice.toFixed(2)

            // 回显图片
            goodsDialogForm.value.dataForm.images = resp.goods.images
            for (let image of resp.goods.images) {
                goodsDialogForm.value.imageUrlArr.push(`${proxy.$minioUrl}/${image}`)
            }

            // 回显套餐类型
            goodsDialogForm.value.dataForm.type = resp.goods.type

            // 回显折扣方案和套餐分区
            goodsDialogForm.value.dataForm.ruleId = resp.goods.ruleId
            goodsDialogForm.value.dataForm.partId = resp.goods.partId == null ? null : resp.goods.partId.toString()

            // 回显 tags
            goodsDialogForm.value.dataForm.tags = resp.goods.tags == null ? [] : resp.goods.tags

            // 回显体检项目
            let typeJson = {
                checkup_1: '科室检查',
                checkup_2: '实验室检查',
                checkup_3: '医技检查',
                checkup_4: '其他检查'
            };

            // 如果 checkup 中任意一个不为空，则初始化为空数组，若所有都为空，则初始化为包含一个空对象的数组
            if (resp.goods.checkup_1 != null || resp.goods.checkup_2 != null || resp.goods.checkup_3 != null || resp.goods.checkup_4 != null) {
                goodsDialogForm.value.goodsItems = []
            } else {
                goodsDialogForm.value.goodsItems = [{}]
            }

            // 遍历 checkup，并将其添加到 goodsItems 中
            for (let type in typeJson) {
                // 如果拥有属性且该属性不为空时，则 push 到 goodsItems 中
                if (resp.goods.hasOwnProperty(type) && resp.goods[type] != null) {
                    for (let item of resp.goods[type]) {
                        goodsDialogForm.value.goodsItems.push({
                            type: typeJson[type],
                            title: item.title,
                            content: item.content
                        })
                    }
                }
            }
        })

    })
}

// 上传图片前处理，参数为上传的文件
const beforeImageUpload = (file: UploadRawFile) => {
    let size = file.size / 1024 / 1024
    if (size > 2) {
        ElMessage.error({
            message: '上传图片大小不能超过 2MB',
            duration: 1000
        })
        return false
    }
    return true
}

// 上传图片成功处理
const imageUploadSuccess = (resp: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
    if (resp.code == 200) {
        let path = resp.path
        // 将上传的图片回显到表单中
        goodsDialogForm.value.dataForm.images.push(path)
        goodsDialogForm.value.imageUrlArr.push(`${proxy.$minioUrl}/${path}`)
    }
}

// 上传图片失败处理
const imageUploadError = (error: Error, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
    ElMessage.error({
        message: '上传图片失败',
        duration: 1000
    })
    console.error(error)
}

const removeImage = (index: number) => {

    // 将要移除的图片添加到 remove
    goodsDialogForm.value.removeImgUrlArr.push(goodsDialogForm.value.dataForm.images[index])

    // 将图片 url 从 imageUrlArr 和 dataForm.images 中移除
    goodsDialogForm.value.imageUrlArr.splice(index, 1)
    goodsDialogForm.value.dataForm.images.splice(index, 1)
}

// 添加 tag
const enterTag = () => {
    // 判断当前书法如标签是否为空
    if (goodsDialogForm.value.newTag != null && goodsDialogForm.value.newTag != '') {
        // 判断当前标签是否已在数组中
        if (goodsDialogForm.value.dataForm.tags.includes(goodsDialogForm.value.newTag)) {
            ElMessage.warning({
                message: '标签已存在',
                duration: 1000
            })
        } else {
            // 添加到标签数组中
            goodsDialogForm.value.dataForm.tags.push(goodsDialogForm.value.newTag)
            // 清空输入框
            goodsDialogForm.value.newTag = null
        }
    }
}

// 移除 tag
const closeTagHandle = (tag: any) => {
    // 获取当前元素的索引
    let index = goodsDialogForm.value.dataForm.tags.indexOf(tag)
    // 从数组中移除该元素
    goodsDialogForm.value.dataForm.tags.splice(index, 1)
}

// 新增体检内容
const insertGoodsItemsHandle = () => {
    goodsDialogForm.value.goodsItems.push({})
}

// 移除体检内容
const deleteGoodsItemsHandle = (index: number) => {
    // .splice(index, 1)：表示从 index 开始删除 1 个元素
    goodsDialogForm.value.goodsItems.splice(index, 1)
}

// 关闭弹窗
const closeGoodsDialog = () => {
    let removeImages = []

    // 若在图片中点击 "x" 按钮，则该元素被添加到 removeImgUrlArr 中，点击关闭弹窗时，将 removeImgUrlArr 中的元素发送到后端进行删除
    // 若多张已上传的图片都没有点击 "x" 按钮而直接关闭弹窗，则将 dataForm.images 中的元素发送到后端进行删除
    // 若多张已上传的图片中部分点击了 "x" 按钮而部分没有点击 "x" 按钮而直接关闭弹窗，则将 removeImgUrlArr 和 dataForm.images 中的元素合并后发送到后端进行删除
    if (goodsDialogForm.value.removeImgUrlArr.length > 0 && goodsDialogForm.value.dataForm.images.length == 0) {
        removeImages = goodsDialogForm.value.removeImgUrlArr
    } else if (goodsDialogForm.value.removeImgUrlArr.length > 0 && goodsDialogForm.value.dataForm.images.length > 0) {
        removeImages = [...new Set([...goodsDialogForm.value.removeImgUrlArr, ...goodsDialogForm.value.dataForm.images])];
    } else {
        removeImages = goodsDialogForm.value.dataForm.images
    }

    // 只要不为空，就删除指定图片
    if (removeImages.length > 0) {
        // 发送请求到后端删除图片
        proxy.$http('/mis/goods/removeImages', 'POST', { removeImages }, true, resp => {
            if (resp.code == 200) {
                goodsDialogForm.value.removeImgUrlArr = []
                goodsDialogForm.value.visible = false
            } else {
                ElMessage.error({
                    message: resp.msg,
                    duration: 1200
                })
            }
        })
    } else {
        goodsDialogForm.value.visible = false
        proxy.$refs['goodsDialogFormRef'].clearValidate()
    }
}


// 弹窗表单提交
const goodsDialogFormSubmit = () => {
    // 校验表单
    proxy.$refs['goodsDialogFormRef'].validate((valid: boolean) => {
        if (valid) {
            // 用于存放所有的体检项目
            // tempCheckup 为一个 JSON 对象，key 为 type 对应的 checkup，value 为一个数组，数组中存放的是体检项目
            let tempCheckup = {}
            // 遍历栅格行
            for (let goodsItem of goodsDialogForm.value.goodsItems) {

                // 检查 type 是否为空
                if (goodsItem.type == undefined || goodsItem.type == '') {
                    ElMessage.error({
                        message: '体检类型不能为空',
                        duration: 1000
                    })
                    return
                }

                // 检查 title 是否为空
                if (goodsItem.title == undefined || goodsItem.title == '') {
                    ElMessage.error({
                        message: '检查项目不能为空',
                        duration: 1000
                    })
                    return
                }

                // 检查 content 是否为空
                if (goodsItem.content == undefined || goodsItem.content == '') {
                    ElMessage.error({
                        message: '检查内容不能为空',
                        duration: 1000
                    })
                    return
                }

                // 检查是否包含有所有的 checkup
                let typeJson = {
                    科室检查: 'checkup_1',
                    实验室检查: 'checkup_2',
                    医技检查: 'checkup_3',
                    其他检查: 'checkup_4'
                }

                // 根据栅格行中 goodsItem 的 type，放入对应的 checkup 中
                // 获取当前 goodsItem 的 type 对应的 checkup
                let type = typeJson[goodsItem.type]
                // 判断当前 type 是否存在 tempCheckup 中
                if (!tempCheckup.hasOwnProperty(type)) {
                    // 如果不存在，则向 tempCheckup 中新添加该 checkup 属性，并将 goodsItem 放入该 checkup 的数组中
                    tempCheckup[type] = [{ title: goodsItem.title, content: goodsItem.content }]
                } else {
                    // 如果存在，则往该 type 对应的 checkup 中放入该 goodsItem 对象
                    tempCheckup[type].push({ title: goodsItem.title, content: goodsItem.content })
                }
            }

            // 所有的检查项目添加到 tempCheckup 后，判断 tempCheckup 中是否包含所有的 checkup，如果有缺少的就添加到 tempCheckup 中，值设置为 null
            ['checkup_1', 'checkup_2', 'checkup_3', 'checkup_4'].forEach(checkup => {
                if (!tempCheckup.hasOwnProperty(checkup)) {
                    tempCheckup[checkup] = null
                }
            })

            // 将 tempCheckup 保存到 checkup 中
            goodsDialogForm.value.checkup = tempCheckup

            // 设置提交的数据
            let tags = goodsDialogForm.value.dataForm.tags

            let goodsFormJSON = {
                id: goodsDialogForm.value.dataForm.id,
                title: goodsDialogForm.value.dataForm.title,
                code: goodsDialogForm.value.dataForm.code,
                description: goodsDialogForm.value.dataForm.description,
                initialPrice: goodsDialogForm.value.dataForm.initialPrice,
                currentPrice: goodsDialogForm.value.dataForm.currentPrice,
                ruleId: goodsDialogForm.value.dataForm.ruleId == '' ? null : goodsDialogForm.value.dataForm.ruleId,
                images: goodsDialogForm.value.dataForm.images,
                type: goodsDialogForm.value.dataForm.type,
                tags: tags != null && tags.length > 0 ? tags : null,
                partId: goodsDialogForm.value.dataForm.partId,
                checkup_1: goodsDialogForm.value.checkup.checkup_1,
                checkup_2: goodsDialogForm.value.checkup.checkup_2,
                checkup_3: goodsDialogForm.value.checkup.checkup_3,
                checkup_4: goodsDialogForm.value.checkup.checkup_4
            }

            // 发送请求
            proxy.$http(`/mis/goods/${goodsDialogForm.value.dataForm.id == null ? 'insertGoods' : 'updateGoods'}`, 'POST', goodsFormJSON, true, resp => {
                if (resp.rows == 1) {
                    ElMessage.success({
                        message: goodsDialogForm.value.dataForm.id == null ? '添加成功' : '修改成功',
                        duration: 1200,
                        onClose: () => {
                            // TODO 删除 removeImgUrlArr 中的图片
                            goodsDialogForm.value.visible = false
                            if (goodsDialogForm.value.dataForm.id == null) {
                                // 获取最后一页的页码
                                let pageIndex = Math.ceil(goodsTable.value.totalCount / goodsTable.value.pageSize)
                                getGoodsList(pageIndex)
                            } else {
                                getGoodsList()
                            }
                        }
                    })
                } else {
                    ElMessage.error({
                        message: goodsDialogForm.value.dataForm.id == null ? '添加失败' : '修改失败',
                        duration: 1000
                    })
                }
            })
        }
    })
}

// 查看商品按钮
const goodsViewHandle = (id: number) => {
    router.push({
        name: 'FrontGoods',
        params: {
            id: id
        }
    });
}

// 删除按钮
const deleteGoodsHandle = (id: number | undefined) => {
    let ids = id == undefined ? goodsTable.value.selections.map((item: any) => item.id) : [id]

    if (ids.length == 0) {
        proxy.$message({
            message: '没有选中记录',
            type: 'warning',
            duration: 1200
        });
    } else {
        ElMessageBox.confirm('是否确定删除选中的套餐？', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            proxy.$http('/mis/goods/deleteGoods', 'POST', { ids: ids }, true, resp => {
                if (resp.rows > 0) {
                    ElMessage.success({
                        message: `已选中删除的${resp.rows}条记录`,
                        duration: 1000,
                        onClose: () => {
                            getGoodsList()
                        }
                    })
                }
            })
        }).catch(() => {
            ElMessage.info({
                message: '取消删除',
                duration: 1200
            })
        })
    }
}

// 复选框是否能被选中
const selectable = (row: any) => {
    if (row.salesVolume == 0 && row.status == false) {
        return true
    }
    return false
}

// 复选框选择事件
const selectionChangeHandle = (val: any) => {
    goodsTable.value.selections = val
}

// 上传或下载文档弹窗
const documentDialog = ref({
    visible: false,
    upload: {
        action: `${proxy.$baseUrl}/mis/goods/uploadCheckupExcel`,              // 上传地址
        headers: {
            token: cookieUtil.getBackendUser()?.token
        },
    },
    data: {
        id: null,
        hasCheckup: null                                                        // 是否有文档
    }
})

// 打开文档上传下载弹窗
const documentHandle = (id: number | undefined, hasCheckup: boolean, scope) => {
    documentDialog.value.data.id = id
    documentDialog.value.data.hasCheckup = hasCheckup           // 后端接口中只接收 id，所以 hasCheckup 并不会被接收
    documentDialog.value.visible = true
}


// 弹窗上传文档前处理
const beforeDocumentUpload = (file) => {
    // 判断上传文件的 大小
    let size = file.size / 1024 / 1024
    if (size > 20) {
        ElMessage.error({
            message: '上传文件大小不能超过 20MB',
            duration: 1000
        })
        return false
    }
    return true
}

// 弹窗上传文档
const documentUploadSuccess = () => {
    documentDialog.value.visible = false
    ElMessage.success({
        message: '上传 excel 文件成功',
        duration: 1200,
        onClose: () => {
            getGoodsList(goodsTable.value.pageIndex)
        }
    })

}

// 弹窗上传文档失败处理
const documentUploadError = (e) => {
    ElMessage.error({
        message: '上传 excel 文件失败',
        duration: 1000
    })
    console.log(e);
}

// 弹窗下载文档 - 使用预签名URL方案
const documentDownloadHandle = () => {
    try {
        let id = documentDialog.value.data.id;

        // 1. 首先请求后端生成预签名 URL，同步请求，等待 URL 生成
        proxy.$http(`/mis/goods/generateDownloadUrl?id=${id}`, 'GET', null, false,
            function (resp) {
                // 2. 获取预签名URL
                const downloadUrl = resp.url;

                // 3. 使用标准方式下载
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = `excel_${id}.xlsx`; // 设置下载文件名

                // 添加到DOM并触发点击
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                ElMessage.success({
                    message: '开始下载 excel 文件',
                    duration: 1200
                });

                documentDialog.value.visible = false;
            }
        );
    } catch (error) {
        console.error('下载失败:', error);
        ElMessage.error('下载失败，请重试');
    }
}

</script>

<style lang="less" scoped>
@import url('goods.less');

.image-uploader-wrapper {
    display: flex;
    flex-wrap: wrap;
}

.uploaded-images {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.uploaded-image-item {
    width: 100px;
    height: 100px;
    border-radius: 6px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.uploaded-image-item:last-child {
    margin-right: 10px;
}

.uploaded-image-item img {
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
</style>
