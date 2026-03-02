<template>
    <div class="person-container" v-if="proxy.$isAuth(['ROOT', 'CHECKUP:INSERT', 'CHECKUP:UPDATE'])">
        <div class="left">
            <el-descriptions title="【 体检人信息 】" direction="vertical" :column="5" border>
                <template #extra>
                    <div class="operate">
                        <el-input placeholder="输入 / 扫码体检编号" v-model="data.dataForm.uuid" ref="uuid" class="uuid"
                            maxlength="32" @keyup="keybordHandle" @keyup.enter.native="searchHandle" clearable />
                        <el-button type="primary" @click="searchHandle">执行查询</el-button>
                    </div>
                </template>
                <el-descriptions-item align="center">
                    <template #label>
                        <div class="cell-item">
                            <el-icon class="icon">
                                <User />
                            </el-icon>
                            姓名
                        </div>
                    </template>
                    {{ data.customer.name }}
                </el-descriptions-item>
                <el-descriptions-item align="center">
                    <template #label>
                        <div class="cell-item">
                            <el-icon class="icon">
                                <Male />
                            </el-icon>
                            性别
                        </div>
                    </template>
                    {{ data.customer.sex }}
                </el-descriptions-item>
                <el-descriptions-item align="center">
                    <template #label>
                        <div class="cell-item">
                            <el-icon class="icon">
                                <Calendar />
                            </el-icon>
                            年龄
                        </div>
                    </template>
                    {{ data.customer.age }}
                </el-descriptions-item>
                <el-descriptions-item align="center">
                    <template #label>
                        <div class="cell-item">
                            <el-icon class="icon">
                                <Phone />
                            </el-icon>
                            电话号码
                        </div>
                    </template>
                    {{ data.customer.tel }}
                </el-descriptions-item>
                <el-descriptions-item align="center">
                    <template #label>
                        <div class="cell-item">
                            <el-icon class="icon">
                                <Postcard />
                            </el-icon>
                            体检编号
                        </div>
                    </template>
                    {{ data.customer.uuid }}
                </el-descriptions-item>
            </el-descriptions>
        </div>
        <div class="right">
            <el-descriptions title="【 医生信息 】" direction="vertical" :column="5" border>
                <template #extra>
                    <el-button type="primary" @click="selectPlaceHandle">选择科室</el-button>
                </template>
                <el-descriptions-item align="center">
                    <template #label>
                        <div class="cell-item">
                            <el-icon class="icon">
                                <User />
                            </el-icon>
                            姓名
                        </div>
                    </template>
                    {{ data.doctor.name }}
                </el-descriptions-item>
                <el-descriptions-item align="center">
                    <template #label>
                        <div class="cell-item">
                            <el-icon class="icon">
                                <Male />
                            </el-icon>
                            性别
                        </div>
                    </template>
                    {{ data.doctor.sex }}
                </el-descriptions-item>
                <el-descriptions-item align="center">
                    <template #label>
                        <div class="cell-item">
                            <el-icon class="icon">
                                <Phone />
                            </el-icon>
                            电话号码
                        </div>
                    </template>
                    {{ data.doctor.tel }}
                </el-descriptions-item>
                <el-descriptions-item align="center">
                    <template #label>
                        <div class="cell-item">
                            <el-icon class="icon">
                                <OfficeBuilding />
                            </el-icon>
                            体检科室
                        </div>
                    </template>
                    {{ data.dataForm.place }}
                </el-descriptions-item>
                <el-descriptions-item align="center">
                    <template #label>
                        <div class="cell-item">
                            <el-icon class="icon">
                                <Calendar />
                            </el-icon>
                            当前日期
                        </div>
                    </template>
                    {{ data.doctor.date }}
                </el-descriptions-item>
            </el-descriptions>
        </div>
    </div>
    <div class="checkup-container">
        <p v-if="data.hasImportedItem === true"
            style="color: red; margin-bottom: 15px; margin-left: 10px; font-size: 18px;">有导入项，测试用数值，上线后修改</p>
        <table>
            <tr>
                <th width="100">序号</th>
                <th width="350" align="center">体检项</th>
                <th width="300" align="left">检查结果</th>
            </tr>
            <tr v-for="(one, index) in data.dataForm.checkup">
                <td align="center">{{ index + 1 }}</td>
                <td align="center">{{ one.item }}</td>
                <td>
                    <div class="value-container">
                        <el-select v-model="one.input.select" class="m-2" placeholder="选择模板值"
                            :disabled="one.type == '导入'" style="width: 400px;">
                            <el-option v-for="item in one.value" :label="item" :value="item" />
                        </el-select>
                        <el-input v-model="one.input.value" :disabled="one.input.select == '未见异常' || one.type == '导入'"
                            placeholder="输入体检值" class="input-value" clearable />
                    </div>
                </td>
            </tr>
        </table>
        <div class="operate" v-if="data.dataForm.checkup.length > 0">
            <el-button type="danger" size="large" @click="clearCheckupHandle">
                重置数据
            </el-button>
            <el-button type="primary" size="large" @click="dataFormSubmit">
                提交体检结果
            </el-button>
        </div>
    </div>

    <el-dialog title="选择科室" v-if="proxy.$isAuth(['ROOT', 'CHECKUP:INSERT', 'CHECKUP:UPDATE'])"
        :close-on-click-modal="false" v-model="dialog.visible" width="300px">
        <el-form :model="data.dataForm" ref="dialogForm" :rules="dialog.dataRule" label-width="80px">
            <el-form-item label="科室名称" prop="placeId">
                <el-select v-model="data.dataForm.placeId" placeholder="选择科室" clearable="clearable"
                    @change="changePlaceHandle">
                    <el-option v-for="one in dialog.allPalceDataList" :label="one.place" :value="one.id" />
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialog.visible = false">取消</el-button>
                <el-button type="primary" @click="confirmPlaceHandle">确定</el-button>
            </span>
        </template>
    </el-dialog>

</template>

<script lang="ts" setup>
import { getCurrentInstance, onMounted, ref } from "vue";

import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'

import { dayjs } from 'element-plus'
import { isBlank } from "../../utils/validate";

const { proxy } = getCurrentInstance() as any;

// 表格数据
const data = ref({
    dataForm: {
        placeId: null,
        place: null,
        uuid: null,
        checkup: [],
        template: null
    },
    customer: {
        name: "<无>",
        sex: "<无>",
        age: "<无>",
        tel: "<无>",
        uuid: "<无>",
        date: null
    },
    doctor: {
        name: null,
        sex: null,
        tel: null,
        date: new Date().toLocaleDateString()
    },
    hasImportedItem: false
});

// 选择科室弹窗
const dialog = ref({
    visible: false,
    allPalceDataList: [],
    dataRule: {
        placeId: [{ required: true, message: "没有选择科室" }],
    },
});

const keybordHandle = (e: any) => {

}

// 根据 uuid 查询体检人信息
const searchHandle = () => {

    if (isBlank(data.value.dataForm.place)) {
        ElMessage.error({
            message: '请先选择科室',
            duration: 1500
        });
    }
    else if (data.value.dataForm.uuid == null || data.value.dataForm.uuid == "") {
        ElMessage.error({
            message: '请输入体检编号',
            duration: 1200
        });
    }
    else if (/^[0-9a-zA-Z]{32}$/.test(data.value.dataForm.uuid) == false) {
        ElMessage.error({
            message: '体检编号不正确',
            duration: 1200
        });
    }
    else {
        // 发送请求查询体检人信息
        proxy.$http(`/mis/appointment/searchCustomerSummaryInfoByUuid/${data.value.dataForm.uuid}`, "GET", null, true, resp => {
            if (resp.code == 200) {
                let customerInfo = resp.customerSummaryInfoVO
                data.value.customer.name = customerInfo.name
                data.value.customer.sex = customerInfo.sex
                data.value.customer.tel = customerInfo.tel
                data.value.customer.age = customerInfo.age
                data.value.customer.uuid = customerInfo.uuid
                data.value.customer.date = customerInfo.appointmentDate

                // 判断是否是今日的体检（若不是今日的也可以执行）
                if (data.value.customer.date != dayjs().format("YYYY-MM-DD")) {
                    proxy.$refs.uuid.blur();
                    ElMessageBox.confirm('不是今日的体检，是否要执行体检?', '提示信息', {
                        confirmButtonText: '执行',
                        cancelButtonText: '拒绝',
                        type: 'error',
                    }).then(() => {
                        loadCheckup()
                    }).catch(() => {
                        clearData()
                    })
                }
                else {
                    loadCheckup()
                }
            } else {
                ElMessage.error({
                    message: "体检人信息查询错误，" + resp.message,
                    duration: 1500
                })
            }
        })
    }
}

// 打开选择科室弹窗，加载所有科室
const selectPlaceHandle = () => {
    dialog.value.visible = true

    proxy.$http("/mis/flowRegulation/searchPlaceList", "GET", null, true, resp => {
        if (resp.code == 200) {
            dialog.value.allPalceDataList = resp.placeList
        }
    })
}

// 确定选择科室
const confirmPlaceHandle = () => {
    dialog.value.visible = false
    data.value.dataForm.place = dialog.value.allPalceDataList.find(item => item.id == data.value.dataForm.placeId).place
}

// 更换科室时，清空原来的数据
const changePlaceHandle = () => {
    clearData()
}

// 清空数据
const clearData = () => {
    // 清空体检人信息
    data.value.customer.name = "<无>"
    data.value.customer.sex = "<无>"
    data.value.customer.tel = "<无>"
    data.value.customer.age = "<无>"
    data.value.customer.uuid = "<无>"
    data.value.customer.date = null

    // 清空体检项
    // data.value.dataForm.uuid = null;
    data.value.dataForm.checkup = []

    // 文本框自动获得焦点
    proxy.$refs.uuid.focus();
}

// 根据科室获取体检项
const loadCheckup = () => {
    let json = {
        uuid: data.value.dataForm.uuid,
        placeId: data.value.dataForm.placeId,
        place: data.value.dataForm.place
    }

    // 发送请求根据科室获取体检项目
    proxy.$http("/mis/checkup/searchCheckupByPlace", "POST", json, true, resp => {
        if (resp.code == 200) {
            let result = resp.checkupResultVO
            //判断该科室是否录入了体检结果
            if (result.hasAlreadyCheckup) {
                ElMessageBox.confirm(
                    '该体检套餐已经存在当前科室的检查结果，是否重新执行检查?',
                    '提示信息',
                    {
                        confirmButtonText: '执行',
                        cancelButtonText: '拒绝',
                        type: 'warning',
                    }
                ).then(() => {

                    data.value.hasImportedItem = false;

                    // 获取体检项目检查结果
                    let checkupItemsResult = result.checkupResultList.find(item => item.place === data.value.dataForm.place).checkupItems

                    for (let one of result.checkupVOList) {

                        let result = checkupItemsResult.find(item => item.checkupName === one.item)

                        // 给每个元素添加 input 属性，跟选择预设值有关，并回显之前的结果
                        // 中文冒号分割，将第一个元素作为 select，第二个元素作为 value
                        let selectAndValue = result.value.split("：");

                        console.log("分割数据：", selectAndValue);


                        if (selectAndValue.length == 1) {
                            one.input = { select: selectAndValue[0], value: null }
                        } else if (selectAndValue.length == 2) {
                            one.input = { select: selectAndValue[0], value: selectAndValue[1] == null ? "" : selectAndValue[1] }
                        } else {
                            ElMessage.error({
                                message: "回显体检结果数据错误，请联系管理员",
                                duration: 2000
                            })
                        }

                        if (one.type == "导入") {
                            data.value.hasImportedItem = true
                        }

                        // 判断预设值是“无”的情况
                        if (one.value == "无") {
                            // 列表项内容为“其他”
                            one.value = ["其他"]
                            // 设置列表选中内容
                            one.input.select = "其他"
                        } else {
                            // 切分预设值形成数组
                            one.value = one.value.split("#")
                        }
                        // 提交体检结果的时候需要提交输入模板种类，该模板与生成体检报告有关
                        data.value.dataForm.template = one.template
                    }
                    data.value.dataForm.checkup = result.checkupVOList
                }).catch(() => {
                    clearData()
                })
            } else {
                for (let one of result.checkupVOList) {
                    one.input = { select: null, value: null }
                    if (one.value == "无") {
                        one.value = ["其他"]
                        one.input.select = "其他"
                    }
                    else {
                        one.value = one.value.split("#")
                    }

                    data.value.dataForm.template = one.template
                }
                data.value.dataForm.checkup = result.checkupVOList
            }

        }

    })
}

// 清空体检项目，重置数据
const clearCheckupHandle = () => {
    for (let one of data.value.dataForm.checkup) {
        if (one.value.length == 1) {
            one.input = { select: "其他", value: null }
        }
        else {
            one.input = { select: null, value: null }
        }
    }
}

// TODO，将 palce 改成 id，提交体检项目检查结果
const dataFormSubmit = () => {
    ElMessageBox.confirm('确认提交当前体检项目检查结果吗？', '提示信息', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        let flag = false;
        let item = []

        // 判断是否有未输入的检查结果
        for (let one of data.value.dataForm.checkup) {
            let input = one.input
            let select = input.select
            let value = input.value

            // 若 select 为空或者 select 为其他时，值为空，这两种情况都表示存在有未输入的检查结果
            if (isBlank(select) || (select == "其他" && isBlank(value))) {
                // 测试用
                if (one.type == "导入") {
                    select = "导入值"
                    value = "1.000"
                } else {
                    flag = true;
                    break;
                }
            }

            // temp：该科室的体检项目数组
            let temp = { "checkupName": one.item, "unit": one.unit, "standard": one.standard }
            if (input.select == "未见异常") {
                temp.value = input.select;;
            }
            else if (input.select == "导入值：1.000") {
                // 测试用
                temp.value = select;
            } else {
                temp.value = value == null ? select : select + "：" + value
            }
            item.push(temp)
        }

        if (flag) {
            ElMessage.error({
                message: '存在未输入的检查结果',
                duration: 1200
            });
            return
        }

        let json = {
            doctorName: data.value.doctor.name,
            customerName: data.value.customer.name,
            uuid: data.value.dataForm.uuid,
            place: data.value.dataForm.place,
            placeId: data.value.dataForm.placeId,
            template: data.value.dataForm.template,
            item: item
        }

        console.log("提交的数据", json);

        proxy.$http("/mis/checkup/addCheckupResult", "POST", json, true, resp => {
            console.log("返回结果", resp);
            if (resp.code == 200) {
                if (resp.nextPlace != null) {
                    ElNotification({
                        title: '通知消息',
                        message: "提交体检结果成功，提醒客户请前往【" + resp.nextPlace.place + "】进行体检，排队人数：" + resp.nextPlace.waitingCount,
                        type: 'success',
                        duration: 5000,
                    });
                    clearData();
                } else {
                    ElNotification({
                        title: '通知消息',
                        message: "所有科室体检均已完成，请前往服务台提交结果完成体检，谢谢！",
                        type: 'success',
                        duration: 3000
                    });
                }

            } else {
                ElMessage.error({
                    message: '提交体检结果失败' + resp.msg,
                    duration: 1200
                })
            }
        })
    })
}

// 获取医生摘要信息
const loadDoctorSummary = () => {
    proxy.$http('/mis/user/searchDoctorById', 'GET', null, false, resp => {
        if (resp.code == 200) {
            let doctor = resp.doctorVO

            data.value.doctor.name = doctor.name;
            data.value.doctor.sex = doctor.sex;
            data.value.doctor.tel = doctor.tel
        }
    })
}

onMounted(() => {
    loadDoctorSummary()

    //监听键盘快捷键
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F2') {
            e.preventDefault()
            proxy.$refs.uuid.focus()
            data.value.dataForm.uuid = null
        }
    })
})

</script>


<style lang="less" scoped>
@import url('doctor_checkup.less');
</style>
