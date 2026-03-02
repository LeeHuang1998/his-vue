<template>
    <div v-if="proxy.$isAuth(['ROOT', 'FLOW_REGULATION:SELECT'])">
        <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
            <el-form-item>
                <el-select v-model="dataForm.id" placeholder="科室名称" clearable="clearable" style="width: 200px;">
                    <el-option v-for="one in data.placeList" :label="one.place" :value="one.id" />
                </el-select>
            </el-form-item>
            <el-form-item prop="blueUuid">
                <el-input v-model="dataForm.blueUuid" placeholder="蓝牙信标UUID" maxlength="32" class="input"
                    clearable="clearable" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="searchHandle()">查询</el-button>
                <el-button type="primary" :disabled="!proxy.$isAuth(['ROOT', 'FLOW_REGULATION:INSERT'])"
                    @click="addHandle()">
                    新增
                </el-button>
                <el-button type="success" @click="searchRealTimeQueueData()">查看实时排队数据</el-button>
                <el-button type="danger" :disabled="!proxy.$isAuth(['ROOT', 'FLOW_REGULATION:DELETE'])"
                    @click="deleteHandle(undefined)">
                    批量删除
                </el-button>
            </el-form-item>
            <el-form-item class="mold">
                <el-switch v-model="dataForm.mode" size="large" active-text="自动调流" inactive-text="手动调流"
                    :before-change="changeModeHandle" />
            </el-form-item>
        </el-form>

        <!-- 数据表格 -->
        <el-table :data="data.dataList" :header-cell-style="{ 'background': '#f5f7fa' }" border v-loading="data.loading"
            @selection-change="selectionChangeHandle">
            <el-table-column type="selection" header-align="center" align="center" width="50"
                :selectable="selectable" />
            <el-table-column type="index" header-align="center" align="center" width="100" label="序号">
                <template #default="scope">
                    <span>{{ (data.pageIndex - 1) * data.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="place" header-align="center" align="center" min-width="250" label="科室名称" />
            <el-table-column prop="blueUuid" header-align="center" align="center" min-width="270" label="蓝牙信标UUID" />
            <el-table-column prop="maxNum" header-align="center" align="center" min-width="80" label="最大排队人数" />
            <el-table-column prop="weight" header-align="center" align="center" min-width="80" label="调流权重" />
            <el-table-column prop="priority" header-align="center" align="center" min-width="80" label="调流优先级" />
            <el-table-column header-align="center" align="center" width="200" label="操作">
                <template #default="scope">
                    <el-button link type="primary" v-if="proxy.$isAuth(['ROOT', 'FLOW_REGULATION:UPDATE'])"
                        :disabled="scope.row.status" @click="updateHandle(scope.row.id)">
                        修改
                    </el-button>
                    <el-button link style="font-weight: bold;" type="warning"
                        v-if="scope.row.isDeleted == 0 && proxy.$isAuth(['ROOT', 'FLOW_REGULATION:UPDATE'])"
                        @click="deactivatePlace(scope.row.id)">
                        停用
                    </el-button>
                    <el-button link style="font-weight: bold;" type="success"
                        v-if="scope.row.isDeleted == 2 && proxy.$isAuth(['ROOT', 'FLOW_REGULATION:UPDATE'])"
                        @click="enablePlace(scope.row.id)">
                        启用
                    </el-button>
                    <el-button link style="font-weight: bold;" type="danger"
                        v-if="proxy.$isAuth(['ROOT', 'FLOW_REGULATION:DELETE'])" :disabled="scope.row.isDeleted !== 2"
                        @click="deleteHandle(scope.row.id)">
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
            :current-page="data.pageIndex" :page-sizes="[10, 20, 50]" :page-size="data.pageSize"
            :total="data.totalCount" layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
    </div>

    <!-- 调流数据新增修改弹窗 -->
    <el-dialog :title="!dialog.placeDataForm.id ? '新增' : '修改'"
        v-if="proxy.$isAuth(['ROOT', 'FLOW_REGULATION:INSERT', 'FLOW_REGULATION:UPDATE'])" :close-on-click-modal="false"
        v-model="dialog.visible" width="450px">
        <el-form :model="dialog.placeDataForm" ref="dialogForm" :rules="dialog.dataRule" label-width="80px">
            <el-form-item label="科室名称" prop="place">
                <el-input v-model="dialog.placeDataForm.place" placeholder="输入科室名称" maxlength="40" clearable />
            </el-form-item>
            <el-form-item label="蓝牙信标" prop="blueUuid">
                <el-input v-model="dialog.placeDataForm.blueUuid" placeholder="输入蓝牙信标UUID" maxlength="32" clearable />
            </el-form-item>
            <el-form-item label="排队上限">
                <el-input-number v-model="dialog.placeDataForm.maxNum" :min="1" :max="500" :step="10" step-strictly />
            </el-form-item>
            <el-form-item label="限流权重">
                <el-slider v-model="dialog.placeDataForm.weight" :step="1" show-stops :min="1" :max="10" />
            </el-form-item>
            <el-form-item label="优先级">
                <el-slider v-model="dialog.placeDataForm.priority" :step="1" show-stops :min="1" :max="10" />
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialog.visible = false">取消</el-button>
                <el-button type="primary" @click="dataFormSubmit">确定</el-button>
            </span>
        </template>
    </el-dialog>

    <el-dialog title="各科室实时排队数据" v-model="realTimeQueueDialog.visible" width="1000px">
        <div class="dialog-content" ref="dialogContentRef">
            <!-- 左侧表格 -->
            <div class="table-container" :class="{ 'with-drawer': realTimeQueueDialog.drawerVisible }">
                <el-table :data="realTimeQueueDialog.dataList" :header-cell-style="{ 'background': '#f5f7fa' }" border
                    v-loading="realTimeQueueDialog.loading" height="500">
                    <el-table-column prop="place" label="科室名称" min-width="150" align="center" header-align="center" />
                    <el-table-column prop="realNum" label="实际排队人数" min-width="100" align="center"
                        header-align="center" />
                    <el-table-column prop="maxNum" label="最大排队人数" min-width="100" align="center"
                        header-align="center" />
                    <el-table-column label="操作" width="150" align="center" header-align="center">
                        <template #default="scope">
                            <el-button link type="primary" @click="searchQueueByPlace(scope.row.id, scope.row.place)">
                                查看
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 实施排队人员名单抽屉 -->
            <transition name="slide">
                <div v-show="realTimeQueueDialog.drawerVisible" class="custom-drawer">
                    <div class="drawer-header">
                        <span>【{{ realTimeQueueDialog.drawerTitle }}】排队名单：</span>
                        <el-button size="small" type="danger" @click="handleDrawerClose">×</el-button>
                    </div>
                    <!-- TODO 样式修改 -->
                    <el-button type="success" class="add-queue-btn"
                        @click="addQueuePersonHandle(realTimeQueueDialog.drawerPlaceId)">添加排队</el-button>
                    <div class="div-line"></div>
                    <div class="drawer-body">
                        <div v-for="person in realTimeQueueDialog.currentQueue" :key="person" class="person-item">
                            {{ person }}
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ElMessage, ElMessageBox } from 'element-plus';
import { getCurrentInstance, onMounted, ref } from 'vue';
const { proxy } = getCurrentInstance() as any;

const dataForm = ref({
    id: null,
    place: null,
    blueUuid: null,
    mode: null
});

// 表格数据
const data = ref({
    placeList: [],
    dataList: [],
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    loading: false,
    selections: []
});

const dataRule = ref({
    blueUuid: [
        { required: false, pattern: '^[a-zA-Z0-9]{32}$', message: '蓝牙信标UUID格式错误' }
    ]
});

// 新增修改弹窗
const dialog = ref({
    visible: false,
    placeDataForm: {
        id: null,
        place: null,
        blueUuid: null,
        maxNum: 10,
        weight: 1,
        priority: 1
    },
    dataRule: {
        place: [
            { required: true, message: '科室名称不能为空' },
            { min: 2, message: '科室名称不能少于2个字符' },
            { pattern: '^[a-zA-Z0-9\u4e00-\u9fa5\(\)]{2,40}$', message: '科室名称格式错误' }
        ],
        blueUuid: [
            { required: true, message: '蓝牙信标UUID不能为空' },
            { pattern: '^[a-zA-Z0-9]{32}$', message: '蓝牙信标UUID格式错误' }
        ]
    }
})

// 查看实时排队数据弹窗
const realTimeQueueDialog = ref({
    visible: false,
    loading: false,
    dataList: [],               // 表格数据
    drawerPlaceId: null,        // 抽屉绑定的科室id
    drawerVisible: false,       // 抽屉是否可见
    drawerTitle: '',            // 抽屉标题
    currentQueue: []            // 当前科室排队名单

})

// 条件查询
const searchHandle = () => {
    proxy.$refs['form'].validate((valid: boolean) => {
        if (valid) {
            proxy.$refs['form'].clearValidate();
            if (dataForm.value.blueUuid == '') {
                dataForm.value.blueUuid = null;
            }
            loadFlowRegulationList();
        } else {
            return false;
        }
    })
}

// 查看实时排队数据
const searchRealTimeQueueData = () => {
    realTimeQueueDialog.value.visible = true;

    proxy.$http('/mis/flowRegulation/searchRealTimeQueueData', 'GET', null, true, resp => {
        if (resp.code == 200) {
            realTimeQueueDialog.value.dataList = resp.realTimeQueueDataVOList;
        } else {
            ElMessage.error({
                message: resp.msg,
                duration: 2000
            });
        }
    })
}

// 获取指定科室的排队人员队列
const searchQueueByPlace = (id: number, place: string) => {
    realTimeQueueDialog.value.drawerVisible = true;
    realTimeQueueDialog.value.drawerTitle = place;

    realTimeQueueDialog.value.drawerPlaceId = id;

    realTimeQueueDialog.value.currentQueue = []

    // 发送请求查询
    proxy.$http('/mis/flowRegulation/searchQueueByPlace/' + id, 'GET', null, true, resp => {
        realTimeQueueDialog.value.currentQueue = resp.placeQueue
    })
}

// 往指定科室中添加排队人员
const addQueuePersonHandle = (id: number) => {
    ElMessageBox.prompt('请输入需要排队的体检单编号', '提示信息', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: "体检编号",
        type: "warning",
        inputPattern: /^[0-9a-zA-Z]{32}$/,
        inputErrorMessage: '体检编号不正确',
    }).then(({ value }) => {
        // 往指定科室中添加排队人员
        proxy.$http('/mis/flowRegulation/addQueuePerson/' + id + '/' + value, "GET", null, true, resp => {
            if (resp.code == 200) {

                if (resp.result) {
                    ElMessage({
                        message: "操作成功，已在本科室中添加排队人员",
                        type: 'success',
                        duration: 2000
                    })
                    searchRealTimeQueueData()
                    searchQueueByPlace(id, realTimeQueueDialog.value.drawerTitle)
                } else {
                    ElMessage({
                        message: "体检人已在本科室排队中，请勿重复排队",
                        type: 'warning',
                        duration: 2000
                    })
                }
            } else {
                ElMessage.error({
                    message: "体检人信息查询错误，" + resp.message,
                    duration: 1500
                })
            }
        })
    })
}

// 关闭排队人员名单 drawer 
const handleDrawerClose = () => {
    realTimeQueueDialog.value.drawerVisible = false;
    realTimeQueueDialog.value.currentQueue = [];
    realTimeQueueDialog.value.drawerPlaceId = null;
}

// 新增调流规则按钮
const addHandle = () => {
    // 重置数据
    dialog.value.placeDataForm.id = null;
    dialog.value.placeDataForm.place = null;
    dialog.value.placeDataForm.blueUuid = null;
    dialog.value.placeDataForm.maxNum = 10;
    dialog.value.placeDataForm.weight = 1;
    dialog.value.placeDataForm.priority = 1;
    dialog.value.visible = true;

    proxy.$nextTick(() => {
        proxy.$refs['dialogForm'].resetFields();
    });
}

// 修改调流规则按钮
const updateHandle = (id: number | undefined) => {

    // 打开弹窗时判断是新增还是修改
    dialog.value.placeDataForm.id = id;
    dialog.value.visible = true;


    proxy.$nextTick(() => {
        proxy.$refs['dialogForm'].resetFields();

        proxy.$http(`/mis/flowRegulation/searchFlowRegulationById/${id}`, 'GET', null, true, resp => {
            let pageVO = resp.pageVO;

            dialog.value.placeDataForm.place = pageVO.place;
            dialog.value.placeDataForm.blueUuid = pageVO.blueUuid;
            dialog.value.placeDataForm.maxNum = pageVO.maxNum;
            dialog.value.placeDataForm.weight = pageVO.weight;
            dialog.value.placeDataForm.priority = pageVO.priority;
        });
    });
}

// 停用指定科室
const deactivatePlace = (id: number) => {
    ElMessageBox.confirm('确定要停用该科室吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        proxy.$http('/mis/flowRegulation/deactivatePlace/' + id, 'PATCH', null, true, resp => {
            if (resp.code == 200) {
                ElMessage.success({
                    message: '停用成功',
                    duration: 2000,
                })
                loadPlaceList()
                loadFlowRegulationMode()
                loadFlowRegulationList()
            } else {
                ElMessage.error({
                    message: '停用失败：' + resp.msg,
                    duration: 3000
                })
            }
        })
    })
}

// 启用指定科室
const enablePlace = (id: number) => {
    ElMessageBox.confirm('确定要启用该科室吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
    }).then(() => {
        proxy.$http('/mis/flowRegulation/enablePlace/' + id, 'PATCH', null, true, resp => {
            if (resp.code == 200) {
                ElMessage.success({
                    message: '启用成功',
                    duration: 2000,
                })
                loadPlaceList()
                loadFlowRegulationMode()
                loadFlowRegulationList()
            } else {
                ElMessage.error({
                    message: '启用失败：' + resp.msg,
                    duration: 3000
                })
            }
        })
    })
}

// 删除或批量删除调流规则
const deleteHandle = (id: number | undefined) => {

    let ids = id == undefined ? data.value.selections.map(item => item.id) : [id]

    if (ids.length == 0) {
        ElMessage.error({
            message: '没有数据被选中',
            duration: 1200
        })
        return
    }

    ElMessageBox.confirm('确定要删除选中科室的调流规则吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {

        let idsJson = {
            ids: ids
        }

        proxy.$http('/mis/flowRegulation/deleteFlowRegulation', 'DELETE', idsJson, true, resp => {
            if (resp.code == 200) {
                ElMessage.success({
                    message: '删除成功，共删除 ' + resp.rows + ' 条数据',
                    duration: 2000,
                    onClose: () => {
                        loadPlaceList()
                        loadFlowRegulationMode()
                        loadFlowRegulationList()
                    }
                });
            } else {
                ElMessage.error({
                    message: '删除失败：' + resp.msg,
                    duration: 3000
                })
            }
        })
    })
}

// 修改调流模式，返回 false 或者返回 Promise 且被 reject 则停止切换
const changeModeHandle = () => {

    // 用于返回是否修改 switch 状态，若返回 true 则表示修改 switch 状态，反之为不修改
    let flag = false;

    ElMessageBox.confirm('确定要修改调流模式吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {

        let json = { value: !dataForm.value.mode}

        proxy.$http('/mis/flowRegulation/changeFlowRegulationMode', 'PATCH', json, true, resp => {
            if (resp.code == 200) {
                ElMessage.success({
                    message: '修改成功',
                    duration: 1200,
                })
                flag = true;

                loadPlaceList()
                loadFlowRegulationMode()
                loadFlowRegulationList()
            } else {
                ElMessage.error({
                    message: '修改失败：' + resp.msg,
                    duration: 2000
                })
                flag = false;
            }
        })
    })
    return flag;

}

// 被选中的科室数据
const selectionChangeHandle = (val: any) => {
    data.value.selections = val;
}

// 是否可被选中
const selectable = (row: any) => {
    return true;
}

// 每页数据条数
const sizeChangeHandle = (val: number) => {
    data.value.pageSize = val;
    data.value.pageIndex = 1;
    loadFlowRegulationList();

}

// 跳转到指定页面
const currentChangeHandle = (val: number) => {
    data.value.pageIndex = val;
    loadFlowRegulationList();
}

// 新增或修改操作表单提交
const dataFormSubmit = () => {
    proxy.$refs['dialogForm'].validate(valid => {
        if (valid) {
            let json = {
                id: dialog.value.placeDataForm.id,
                place: dialog.value.placeDataForm.place,
                blueUuid: dialog.value.placeDataForm.blueUuid,
                maxNum: dialog.value.placeDataForm.maxNum,
                weight: dialog.value.placeDataForm.weight,
                priority: dialog.value.placeDataForm.priority
            };

            let url = `/mis/flowRegulation/${dialog.value.placeDataForm.id == null ? 'insert' : 'update'}`

            proxy.$http(url, 'POST', json, true, resp => {
                if (resp.code == 200 && resp.result) {
                    ElMessage.success({
                        message: '操作成功',
                        duration: 1200,
                        onClose: () => {
                            dialog.value.visible = false;
                            loadFlowRegulationList();
                        }
                    });
                } else {
                    ElMessage.error({
                        message: '操作失败：' + resp.msg,
                        type: 'error',
                        duration: 1200
                    });
                }
            });
        }
    })
}

// 获取科室数据
const loadPlaceList = () => {
    proxy.$http("/mis/flowRegulation/searchPlaceList", "GET", null, true, resp => {
        data.value.placeList = resp.placeList
    })
}

// 获取调流模式
const loadFlowRegulationMode = () => {
    proxy.$http("/mis/flowRegulation/searchFlowRegulationMode", "GET", null, true, resp => {
        dataForm.value.mode = resp.mode
    })
}

// 分页数据加载
const loadFlowRegulationList = () => {
    let json = {
        page: data.value.pageIndex,
        length: data.value.pageSize,
        id: dataForm.value.id,
        blueUuid: dataForm.value.blueUuid,
    }

    proxy.$http("/mis/flowRegulation/searchFlowRegulationPage", "POST", json, true, resp => {
        if (resp.code == 200) {
            let pageData = resp.pageData

            data.value.dataList = pageData.pageList
            data.value.totalCount = pageData.totalCount
            data.value.pageIndex = pageData.pageIndex
            data.value.pageSize = pageData.pageSize

            data.value.loading = false

            console.log("刚开始的 mode：", dataForm.value.mode);

        }

    })
}

onMounted(() => {
    loadPlaceList()
    loadFlowRegulationMode()
    loadFlowRegulationList()
})

</script>

<style lang="less" scoped>
@import url('flow_regulation.less');

.mold {
    float: right;
    margin-right: 0 !important;
}

.input {
    width: 250px !important;
}
</style>
