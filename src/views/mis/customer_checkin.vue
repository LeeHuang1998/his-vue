<template>
    <div v-if="proxy.$isAuth(['ROOT', 'APPOINTMENT:SELECT'])">
        <!-- 查询条件表单 -->
        <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
            <el-form-item>
                <el-date-picker v-model="dataForm.date" type="date" placeholder="选择日期" :editable="false"
                    format="YYYY-MM-DD" value-format="YYYY-MM-DD" :clearable="false" />
            </el-form-item>
            <el-form-item prop="name">
                <el-input v-model="dataForm.name" placeholder="姓名" maxlength="10" class="input" clearable="clearable" />
            </el-form-item>
            <el-form-item prop="tel">
                <el-input v-model="dataForm.tel" placeholder="电话号码" maxlength="11" class="input"
                    clearable="clearable" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="searchHandle()">查询</el-button>
                <el-button type="success" @click="checkinHandle()">体检签到</el-button>
                <el-button type="warning" @click="continueCheckup()">继续体检</el-button>
                <el-button type="danger" @click="finishHandle()">完成体检</el-button>
            </el-form-item>
            <el-form-item class="mold">
                <el-radio-group v-model="dataForm.statusLabel" @change="searchHandle()">
                    <el-radio-button value="全部">全部</el-radio-button>
                    <el-radio-button value="未签到">未签到</el-radio-button>
                    <el-radio-button value="已签到">已签到</el-radio-button>
                    <el-radio-button value="已结束">已结束</el-radio-button>
                    <el-radio-button value="已关闭">已关闭</el-radio-button>
                </el-radio-group>
            </el-form-item>
        </el-form>

        <!-- 表格数据 -->
        <el-table :data="data.dataList" :header-cell-style="{ 'background': '#f5f7fa' }" border v-loading="data.loading"
            @selection-change="selectionChangeHandle">
            <el-table-column type="selection" :selectable="selectable" header-align="center" align="center" width="50"
                fixed />
            <el-table-column type="index" header-align="center" align="center" width="120" label="序号" fixed>
                <template #default="scope">
                    <span>{{ (data.pageIndex - 1) * data.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="name" header-align="center" align="center" label="姓名" width="120" fixed />
            <el-table-column prop="sex" header-align="center" align="center" label="性别" width="70" />
            <el-table-column prop="age" header-align="center" align="center" label="年龄" width="70" />
            <el-table-column prop="tel" header-align="center" align="center" label="联系电话" width="150" />
            <el-table-column prop="pid" header-align="center" align="center" label="身份证号" width="190" />
            <el-table-column prop="appointmentDate" header-align="center" align="center" label="预约日期" width="190" />
            <el-table-column header-align="center" align="center" label="备注" width="200">
                <template #default="scope">
                    <el-tooltip effect="dark" :content="scope.row.desc || ''" placement="bottom"
                        :disabled="!(scope.row.desc && scope.row.desc.length > 20)" raw-content>
                        <div class="text-ellipsis-cell">
                            {{ scope.row.desc }}
                        </div>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column prop="goodsTitle" header-align="center" align="center" label="体检套餐" min-width="200">
                <template #default="scope">
                    <el-tooltip effect="dark" :content="scope.row.goodsTitle || ''" placement="bottom"
                        :disabled="!(scope.row.goodsTitle && scope.row.goodsTitle.length > 10)" raw-content>
                        <div class="text-ellipsis-cell">
                            {{ scope.row.goodsTitle }}
                        </div>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column prop="status" header-align="center" align="center" label="状态" width="120">
                <template #default="scope">
                    <el-tag :type="getStatusType(scope.row.status)" effect="dark">{{ scope.row.statusText }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
                <template #default="scope">
                    <el-button type="primary" link :disabled="!proxy.$isAuth(['ROOT', 'APPOINTMENT:SELECT'])"
                        @click="guidanceHandle(scope.row.id)">
                        导引单
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
            :current-page="data.pageIndex" :page-sizes="[10, 20, 50]" :page-size="data.pageSize"
            :total="data.totalCount" layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
    </div>

    <!-- 签到弹窗 -->
    <el-dialog title="体检签到" v-if="proxy.$isAuth(['ROOT', 'APPOINTMENT:UPDATE'])" :close-on-click-modal="false"
        v-model="checkinDialog.visible" width="500px" :before-close="closeHandle">
        <div class="card-info">
            <div class="left">
                <el-form :model="checkinDialog.dataForm" ref="dialogForm" label-width="60px">
                    <el-form-item label="姓名">
                        <el-input v-model="checkinDialog.dataForm.name" disabled />
                    </el-form-item>
                    <el-form-item label="性别">
                        <el-input v-model="checkinDialog.dataForm.sex" disabled />
                    </el-form-item>
                    <el-form-item label="身份证">
                        <el-input v-model="checkinDialog.dataForm.pid" disabled />
                    </el-form-item>
                </el-form>
            </div>
            <div class="right">
                <img :src="checkinDialog.dataForm.photo_1" class="photo"
                    v-if="checkinDialog.dataForm.photo_1 != null" />
                <div class="empty" v-if="checkinDialog.dataForm.photo_1 == null">
                    <el-icon :size="60" class="icon">
                        <Avatar />
                    </el-icon>
                </div>
            </div>
        </div>
        <div class="photo-container">
            <!-- 三个控件，还没开始拍照时，showEmpty 为 true，showVideo 和 showPhoto 为 false -->
            <div class="empty" v-show="checkinDialog.showEmpty">
                <SvgIcon name="camera" class="camera" />
                <ol>
                    <li>先刷体检人身份证，验证通过后会自动启动摄像头。</li>
                    <li>必须要注意拍摄照片中只能有唯一的人脸面部信息，如果存在多张人脸则会报错。</li>
                    <li>务必拍摄体检人正脸照片，不可以佩戴墨镜或者遮挡面部的配饰。</li>
                </ol>
            </div>
            <!-- 开始拍照，摄像头视频流数据显示在 video 元素上，此时 showVideo 为 true，其他两个为 false -->
            <video ref="videoRef" autoplay v-show="checkinDialog.showVedio"
                style="margin-right: auto; margin-left: auto;"></video>
            <!-- 拍照完毕，显示拍摄的照片，此时 showPhoto 为 true，其他两个为 false -->
            <canvas ref="photoRef" width="470" height="300" v-show="checkinDialog.showPhoto">
            </canvas>
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" :icon="btnIconRef" :disabled="checkinDialog.showEmpty"
                    @click="takePhotoHandle">
                    {{ checkinDialog.btnText }}
                </el-button>
                <el-button @click="closeHandle">取消</el-button>
                <el-button type="success"
                    :disabled="checkinDialog.dataForm.pid == null || checkinDialog.dataForm.photo_2 == null"
                    @click="dataFormSubmit">
                    签到
                </el-button>
            </span>
        </template>
    </el-dialog>

    <!-- 导引单弹窗 -->
    <el-dialog title="体检导引单" v-if="proxy.$isAuth(['ROOT', 'APPOINTMENT:SELECT'])" v-model="guidanceDialog.visible"
        width="800px">
        <div class="guidance" id="pdfDom" :name="guidanceDialog.name">
            <h2 class="title">大健康体检项目导引单</h2>
            <div class="summary">
                <table class="base-info">
                    <tr>
                        <td class="label">姓名:</td>
                        <td class="value">{{ guidanceDialog.name }}</td>
                        <td class="label">性别:</td>
                        <td class="value">{{ guidanceDialog.sex }}</td>
                        <td class="label">年龄:</td>
                        <td class="value">{{ guidanceDialog.age }}</td>
                    </tr>
                    <tr>
                        <td class="label">身份证:</td>
                        <td class="value">{{ guidanceDialog.pid }}</td>
                        <td class="label">电话:</td>
                        <td class="value">{{ guidanceDialog.tel }}</td>
                        <td class="label">日期:</td>
                        <td class="value">{{ guidanceDialog.date }}</td>
                    </tr>
                    <tr>
                        <td class="label">备注:</td>
                        <td colspan="5" class="value">
                            {{ guidanceDialog.desc }}
                        </td>
                    </tr>
                </table>
                <img class="qrcode" :src="guidanceDialog.qrCodeBase64" />
            </div>
            <table class="checkup">
                <tr>
                    <th>序号</th>
                    <th align="left">检查地点</th>
                    <th align="left">检查项目</th>
                    <th>体检医生</th>
                </tr>
                <tr v-for="(one, index) in guidanceDialog.checkup">
                    <td align="center">{{ index + 1 }}</td>
                    <td>{{ one.place }}</td>
                    <td>{{ one.name }}</td>
                    <td></td>
                </tr>
            </table>
            <div class="desc">
                <p>请注意：体检结束10天后，即可在大健康网站（http://www.leehuang.com）查询到您的体检报告。之后的5个工作日之内，您将收到本体检中心邮寄的体检报告，请留意查收！</p>
                <ul>
                    <li>
                        <el-icon>
                            <PhoneFilled />
                        </el-icon>
                        <span>体检咨询：010-1234567</span>
                    </li>
                    <li>
                        <el-icon>
                            <PhoneFilled />
                        </el-icon>
                        <span>体检咨询：010-1234567</span>
                    </li>
                    <li>
                        <el-icon>
                            <PhoneFilled />
                        </el-icon>
                        <span>体检咨询：010-1234567</span>
                    </li>
                </ul>
            </div>
        </div>
        <div class="operate">
            <el-button type="primary" size="large" :icon="Document" @click="proxy.$getPdf()">
                下载导引单
            </el-button>
        </div>
    </el-dialog>

    <!-- 体检单进度弹窗 -->
    <el-dialog title="继续体检" v-if="proxy.$isAuth(['ROOT', 'APPOINTMENT:SELECT', 'APPOINTMENT:UPDATE'])"
        v-model="continueDialog.visible">
        <div class="guidance">
            <h2 class="title">本次体检项目</h2>
            <div class="summary">
                <table class="base-info">
                    <tr>
                        <td class="label">姓名:</td>
                        <td class="value">{{ continueDialog.name }}</td>
                        <td class="label">性别:</td>
                        <td class="value">{{ continueDialog.sex }}</td>
                        <td class="label">年龄:</td>
                        <td class="value">{{ continueDialog.age }}</td>
                    </tr>
                    <tr>
                        <td class="label">身份证:</td>
                        <td class="value">{{ continueDialog.pid }}</td>
                        <td class="label">电话:</td>
                        <td class="value">{{ continueDialog.tel }}</td>
                        <td class="label">签到日期:</td>
                        <td class="value">{{ continueDialog.date }}</td>
                    </tr>
                </table>
            </div>
            <table class="checkup">
                <tr>
                    <th>序号</th>
                    <th>检查科室</th>
                    <th>是否已完成</th>
                </tr>
                <tr v-for="(one, index) in continueDialog.placeList">
                    <td align="center">{{ index + 1 }}</td>
                    <td align="center" :class="{ 'isCompleted-null': one.isCompleted === null }">{{ one.place }}</td>
                    <td align="center" :class="{
                            'isCompleted-true': one.isCompleted === true,
                            'isCompleted-false': one.isCompleted === false,
                            'isCompleted-null': one.isCompleted === null
                        }">
                        {{
                            one.isCompleted === true ? '已完成' :
                                one.isCompleted === false ? '未完成' : '暂时停用'
                        }}
                    </td>
                </tr>
            </table>
        </div>
        <div class="continue-operate">
            <el-button size="large" type="success" @click="recommentNextPlace(continueDialog.uuid)">继续体检</el-button>
            <el-button auto-insert-space size="large" type="danger"
                @click="continueDialog.visible = false">取消</el-button>
        </div>
    </el-dialog>

</template>

<script lang="ts" setup>
import { getCurrentInstance, ref, onMounted, markRaw, shallowRef, nextTick } from 'vue';

import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';
import { Camera, RefreshRight, Document } from '@element-plus/icons-vue';

import router from '../../router/index';

import { dayjs } from 'element-plus';
import isBetween from 'dayjs/plugin/isBetween';

// 扩展 isBetween 插件，用于判断一个日期是否在两个日期之间
dayjs.extend(isBetween);

const { proxy } = getCurrentInstance() as any;

// 查询表单
const dataForm = ref({
    name: null,
    tel: null,
    date: dayjs().format('YYYY-MM-DD'),
    statusLabel: '全部',
    status: null
});
// 查询表单规则
const dataRule = ref({
    name: [{ pattern: '^[\u4e00-\u9fa5]{1,10}$', message: '姓名格式错误' }],
    tel: [{ pattern: '^1[1-9]\\d{9}$', message: '电话号码格式错误' }]
});

// 数据表格
const data = ref({
    dataList: [],
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    loading: false,
    selections: []
});

// 签到弹窗
const checkinDialog = ref({
    visible: false,
    btnText: '拍照',
    // btnIcon: Camera,
    showEmpty: true,                        // 拍照区域，还没开始拍照时的空状态
    showVedio: false,                       // 开始拍照，显示 video 元素的状态
    showPhoto: false,                       // 拍照完毕，显示照片的状态
    streamTrack: null,
    dataForm: {
        name: null,
        sex: null,
        pid: null,
        photo_1: null,
        photo_2: null
    }
});

// 导引单弹窗
const guidanceDialog = ref({
    visible: false,
    name: null,
    sex: null,
    age: null,
    pid: null,
    tel: null,
    date: null,
    desc: null,
    qrCodeBase64: null,
    checkup: []
});

// 继续体检弹窗
const continueDialog = ref({
    visible: false,
    name: null,
    sex: null,
    age: null,
    pid: null,
    tel: null,
    date: null,
    uuid: null,
    placeList: [],
    isAllCompleted: false
})

// 拍照按钮点击事件
const btnIconRef = shallowRef(Camera); // 初始为 Camera

// 分页查询数据
const loadCheckInPageData = () => {
    if (checkinDialog.value.streamTrack) {
        checkinDialog.value.streamTrack.stop();
        checkinDialog.value.streamTrack = null;
    }

    data.value.loading = true;
    if (dataForm.value.statusLabel == '全部') {
        dataForm.value.status = null;
    } else if (dataForm.value.statusLabel == '未签到') {
        dataForm.value.status = 1;
    } else if (dataForm.value.statusLabel == '已签到') {
        dataForm.value.status = 2;
    } else if (dataForm.value.statusLabel == '已结束') {
        dataForm.value.status = 3;
    }
    else if (dataForm.value.statusLabel == '已关闭') {
        dataForm.value.status = 4;
    }
    let json = {
        name: dataForm.value.name,
        tel: dataForm.value.tel,
        appointmentDate: dataForm.value.date,
        status: dataForm.value.status,
        page: data.value.pageIndex,
        length: data.value.pageSize
    };

    proxy.$http('/mis/appointment/searchAppointmentByPageForMis', 'POST', json, true, function (resp: any) {
        let pageData = resp.pageData;

        let temp = {
            '1': '未签到',
            '2': '已签到',
            '3': '已结束',
            '4': '已关闭'
        };

        for (let one of pageData.pageList) {
            one.statusCode = one.status;
            one.statusText = temp[one.status];
        }

        data.value.dataList = pageData.pageList;
        data.value.totalCount = pageData.totalCount;
        data.value.loading = false;
    });
}

// 获取表格中状态的标签类型
const getStatusType = (status) => {
    switch (status) {
        case 1: // 未签到
            return 'danger';
        case 2: // 已签到
            return 'success';
        case 3: // 已结束
            return 'primary';
        case 4: // 已关闭
            return 'info';
        default:
            return 'primary';
    }
};

// 条件查询
const searchHandle = () => {
    proxy.$refs['form'].validate(valid => {
        if (valid) {
            proxy.$refs['form'].clearValidate();
            if (dataForm.value.name == '') {
                dataForm.value.name = null;
            }
            if (dataForm.value.tel == '') {
                dataForm.value.tel = null;
            }
            if (data.value.pageIndex != 1) {
                data.value.pageIndex = 1;
            }
            loadCheckInPageData();
        } else {
            return false;
        }
    });
}

// 签到操作
const checkinHandle = () => {
    // 获取当前日期
    let current = dayjs().format("YYYY-MM-DD")

    if (current != dataForm.value.date) {
        ElMessage.warning({
            message: `请将日期改为${current}`,
            duration: 1200
        });
    }
    else {
        // 创建 ws 连接
        conWS();

        checkinDialog.value.dataForm.name = null;
        checkinDialog.value.dataForm.sex = null;
        checkinDialog.value.dataForm.pid = null;
        checkinDialog.value.dataForm.photo_1 = null;
        checkinDialog.value.dataForm.photo_2 = null;
        checkinDialog.value.showEmpty = true;
        checkinDialog.value.showVedio = false;
        checkinDialog.value.showPhoto = false;
        checkinDialog.value.visible = true;
    }
}

// 关闭弹窗
const closeHandle = () => {
    if (checkinDialog.value.streamTrack) {
        checkinDialog.value.streamTrack.stop();
        checkinDialog.value.streamTrack = null;
    }
    disconWS();
    checkinDialog.value.visible = false;
}

// 将 YYYYMMDD 格式的日期字符串转换 成YYYY-MM-DD 格式
// 三个参数：日期字符串，日期分隔符，字符串中是否有填充 0（如 7 月 -> 07）
function parseDateString(str, deco, zero) {
    let year = str.substr(0, 4)
    let month = str.substr(4, 2)
    let date = str.substr(6)
    if (zero) {
        month = month.substr(0, 1) === "0" ? month.substr(1) : month
        date = date.substr(0, 1) === "0" ? date.substr(1) : date
    }
    return `${year}${deco}${month}${deco}${date}`
}

// 自定义定义 base16 解码函数。将对 base64 字符串解码后得到的字符串（base16 十六进制编码字符串）转换为普通字符串
// 身份证信息是先用 base16（十六进制编码） 编码，再用 base64 编码。
// 先使用 JS 自带的 atbo 函数解码 base64 字符串，解码后得到 base16 编码的字符串，然后再将该字符串使用 base16 解码函数解码为铍铜字符串
function hex2a(hex) {
    let str_list = ''
    for (let i = 0; i < hex.length && hex.substr(i, 2) !== '00'; i += 2) {
        const a = hex.charCodeAt(i)
        const b = hex.charCodeAt(i + 1)
        const c = b * 256 + a
        str_list += String.fromCharCode(c)
    }

    return str_list.toString()
}

let ws = null
// 创建 ws 连接，被动读卡器读取身份证信息
function conWS() {
    // 发送请求给 webSocket服务器，读取身份证信息
    const webUrl = 'ws://127.0.0.1:30004/ws'
    ws = new WebSocket(webUrl)

    // 当前网页与服务器建立 websocket 连接成功后，会触发 onopen 事件：
    ws.onopen = function (evt) {
        let szhelp = 'websocket 连接成功，url[' + webUrl + ']，读卡器上放置身份证后websocket会自动接收身份证数据，如需手动操作请调用 WS_ReadInfo() 函数\r\n\r\n'
        szhelp += '支持被动接收和主动请求两种方式\r\n'
        szhelp += '被动接收:当读卡器刷卡成功后会推送身份证信息到websocket，websocket直接显示即可\r\n'
        szhelp += '主动请求:支持网页端主动向服务器请求对应的消息。可查看<WS_ReadInfo><WS_GetASN><WS_GetBCardNo>这三个接口'

        console.log(szhelp)
    }

    // onclose：当连接被关闭时触发
    ws.onclose = function (evt) {
        console.log('websocket已断开');
    }

    // 当前网页接收到推送的读卡结果，触发 onmessage 事件：
    ws.onmessage = function (messageEvent) {
        // 将获取的身份证字符串数据转换为 JSON 对象
        const jsonobject = JSON.parse(messageEvent.data)
        // Ret：服务器返回身份证信息结果，0表示成功，其他表示失败
        console.log(jsonobject);

        if (jsonobject.Ret == 0) {
            // Cmd：服务器返回的命令编号，10001 表示被动读卡身份证信息（即读卡器刷卡成功后会推送身份证信息到 websocket，websocket 直接显示）
            if (jsonobject.Cmd == 10001) {
                // UserParam：服务器返回的身份证解码信息，为 base64 编码的字符串
                console.log("读取身份证成功");
                // 身份证信息
                const userParam = JSON.parse(window.atob(jsonobject.UserParam))
                console.log(userParam);

                // 姓名（结尾包含空格，字符串总长度为15个字符，必须要去除结尾空格）
                const name = hex2a(window.atob(userParam.CardInfo.Name)).trim();
                // 性别
                const sex = hex2a(window.atob(userParam.CardInfo.Sex)) == 1 ? '男' : '女';
                console.log("性别：", hex2a(window.atob(userParam.CardInfo.Sex)));
                // 身份证号
                const pid = hex2a(window.atob(userParam.CardInfo.No));
                // 生日（例如19980101）
                const birthdayTemp = hex2a(window.atob(userParam.CardInfo.Birthday));
                // 转换生日格式
                const birthday = parseDateString(birthdayTemp, '-', true);
                // 照片
                const image = 'data:image/jpg;base64,' + userParam.BmpInfo;
                // 起始有效期
                const validityPeriodBegin = hex2a(window.atob(userParam.CardInfo.ValidityPeriodBegin));
                // 将起始有效期转换为 YYYY-MM-DD 格式
                const expiryBegin = parseDateString(validityPeriodBegin, '-', true);
                // 截止有效期
                const validityPeriodEnd = hex2a(window.atob(userParam.CardInfo.ValidityPeriodEnd)).trim();
                // 将截止有效期转换为 YYYY-MM-DD 格式，若为长期则直接设置为'长期'，若不为长期则转换为 YYYY-MM-DD 格式
                const expiryEnd = validityPeriodEnd !== '长期' ? parseDateString(validityPeriodEnd, '-', true) : validityPeriodEnd;

                console.log("所有解码后的信息：", name, sex, pid, birthday, image, expiryBegin, expiryEnd);


                if (expiryEnd !== '长期') {
                    // 判断是否在有效期范围
                    let valid = dayjs().isBetween(expiryBegin, expiryEnd);
                    console.log("身份证是否有效：", valid)
                    if (!valid) {
                        ElMessage.error({
                            message: '身份证已过期',
                            duration: 1500
                        });
                        return
                    }
                }

                //TODO 比对身份证信息与体检人信息是否一致
                let identityJson = {
                    name: name,
                    pid: pid,
                    sex: sex,
                    image: image
                }

                // 发送请求到接口查询是否有预约数据
                hasAppointment(identityJson)


            } else if (jsonobject.Cmd == 1000) {
                const userParam = JSON.parse(window.atob(jsonobject.UserParam));
                if (userParam.State == 0) {
                    console.log('读卡器已被拔出')
                }
                else console.log('读卡器已插入')
            }
        } else {
            console.log('websocket 协议调用失败，原因：' + jsonobject.ErrInfo)
        }
    }
}

// 断开 ws
function disconWS() {
    if (ws) {
        ws.close()
        console.log('websocket已断开')
    }
}

// 发送请求到接口查询是否有预约数据
const hasAppointment = (identityJson: object) => {
    proxy.$http('/mis/appointment/hasAppointmentInToday', 'POST', identityJson, true, resp => {
        console.log(resp);

        if (resp.code == 200) {
            let appointmentResult = resp.appointmentResult;

            if (!appointmentResult == null) {
                ElMessage.warning({
                    message: '该用户没有预约记录',
                    duration: 1500
                })
            } else {
                switch (appointmentResult) {
                    case 1: // 未签到
                        // 在弹窗中显示身份证信息
                        checkinDialog.value.dataForm.name = identityJson.name
                        checkinDialog.value.dataForm.pid = identityJson.pid
                        checkinDialog.value.dataForm.sex = identityJson.sex
                        checkinDialog.value.dataForm.photo_1 = identityJson.image
                        // 开启摄像头
                        openCamera()
                        break
                    case 2: // 已签到
                        ElMessage.warning({
                            message: '该用户已签到，请勿重复签到',
                            duration: 1500
                        })
                        break
                    case 3: // 已结束
                        ElMessage.warning({
                            message: '该预约已结束',
                            duration: 1500
                        })
                        break
                    case 4: // 已关闭
                        ElMessage.warning({
                            message: '该预约已关闭',
                            duration: 1500
                        })
                        break
                    default:
                        ElMessage.error({
                            message: '未知的预约状态',
                            duration: 1500
                        })
                }
            }
        } else {
            ElMessage.error({
                message: "预约查询错误，原因：" + resp.message, // 注意字段名可能不同
                duration: 1500
            })
        }
    })
}

// 添加video和canvas的ref变量
const videoRef = ref<HTMLVideoElement | null>(null);
const photoRef = ref<HTMLCanvasElement | null>(null);

// 开启摄像头
const openCamera = async () => {
    await nextTick();

    // 获取摄像头 api：navigator.mediaDevices.getUserMedia
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({
            video: {
                width: 470,
                height: 300,
                facingMode: 'user' // 前置摄像头
            }
        }).then(stream => {
            // 根据 id 获取视图层中的 video 元素
            // let video = document.querySelector('#videoRef');
            let video = videoRef.value;
            if (video) {
                // 设置视频数据流到 videoRef 控件
                video.srcObject = stream;
                // 将视频流保存到模型层，之后关闭弹窗时可以切断视频流，释放资源
                checkinDialog.value.streamTrack = stream.getTracks()[0];    // 只保存视频轨道

                // 加载视频流到 video 元素
                video.onloadedmetadata = function (e) {
                    video.play();
                    checkinDialog.value.showEmpty = false;
                    checkinDialog.value.showPhoto = false;
                    checkinDialog.value.showVedio = true;
                };
            } else {
                ElMessage.error({
                    message: '视频元素未找到',
                    duration: 3000
                })
            }
        }).catch(err => {
            console.error('摄像头开启失败:', err);
            ElMessage.error({
                message: '开启摄像头失败：' + (err.message || '未知错误'),
                duration: 3000
            });
            // 如果摄像头开启失败，可以显示照片上传选项
            // checkinDialog.value.showEmpty = false;
            // checkinDialog.value.showPhoto = true;
            // checkinDialog.value.showVedio = false;
        });
    } else {
        ElMessage.error({
            message: '当前设备不支持摄像头或未连接摄像头',
            duration: 3000
        });
    }
}

// 继续体检窗口，查询体检单信息
const continueCheckup = () => {
    ElMessageBox.prompt('请输入需要继续体检的体检单编号', '提示信息', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: "体检编号",
        type: "warning",
        inputPattern: /^[0-9a-zA-Z]{32}$/,
        inputErrorMessage: '体检编号不正确',
    }).then(({ value }) => {
        // 发送请求查询体检人信息
        proxy.$http('/mis/appointment/continueCheckup/' + value, "GET", null, true, resp => {
            if (resp.code == 200) {
                // 查询成功，将数据保存到 continueDialog.value 中
                continueDialog.value.visible = true

                let continueCheckupVO = resp.continueCheckupVO

                console.log(continueCheckupVO);

                continueDialog.value.name = continueCheckupVO.summaryInfoVO.name
                continueDialog.value.sex = continueCheckupVO.summaryInfoVO.sex
                continueDialog.value.age = continueCheckupVO.summaryInfoVO.age
                continueDialog.value.pid = continueCheckupVO.summaryInfoVO.pid
                continueDialog.value.tel = continueCheckupVO.summaryInfoVO.tel
                continueDialog.value.uuid = continueCheckupVO.summaryInfoVO.uuid
                continueDialog.value.date = dayjs(continueCheckupVO.summaryInfoVO.checkinTime).format('YYYY-MM-DD HH:mm:ss')
                continueDialog.value.placeList = continueCheckupVO.checkupPlace

                continueDialog.value.isAllCompleted = continueCheckupVO.checkupPlace.every(place => place.isCompleted !== false);
            } else {
                ElMessage.error({
                    message: "体检人信息查询错误，" + resp.message,
                    duration: 1500
                })
            }
        })
    })
}

// 继续体检按钮，往计算下一个推荐的科室并进行排队
const recommentNextPlace = (uuid: string) => {

    // 判断是否所有体检项都已完成
    if (continueDialog.value.isAllCompleted) {
        ElMessage({
            message: "所有体检项的结果都已提交，请前往服务台完成体检",
            type: 'warning',
            duration: 2000
        })
    } else {
        ElMessageBox.confirm('确定给当前用户继续体检？', '提示信息', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: "warning",
        }).then(() => {
            proxy.$http('/mis/flowRegulation/getRecommendNextPlace/' + uuid, "GET", null, true, resp => {
                if (resp.code == 200) {
                    let nextPlace = resp.nextPlace

                    if (nextPlace !== null) {
                        ElNotification({
                            title: '通知消息',
                            message: "操作成功，请前往【" + nextPlace.place + "】进行体检，目前排队人数：" + nextPlace.waitingCount,
                            type: 'success',
                            duration: 3000
                        });

                        continueDialog.value.visible = false

                        // 重新加载页面数据
                        loadCheckInPageData();
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
                        message: '操作失败，原因：' + resp.message,
                        duration: 1500
                    })
                }
            })
        })
    }


}

// 完成体检
const finishHandle = () => {
    ElMessageBox.prompt('请输入体检单编号，结束本次体检', '提示信息', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: "体检编号",
        type: "warning",
        inputPattern: /^[0-9a-zA-Z]{32}$/,
        inputErrorMessage: '体检编号不正确',
    }).then(({ value }) => {

        let json = {
            uuid: value,
            status: 3
        }

        proxy.$http("/mis/appointment/updateStatusByUuid", "POST", json, true, function (resp) {
            if (resp.code == 200 && resp.result) {
                ElMessage.success({
                    message: '操作成功',
                    duration: 1500,
                    onClose: () => {
                        loadCheckInPageData();
                    }
                });
            } else {
                ElMessage.error({
                    message: '未能更新记录' + resp.message,
                    duration: 1200
                });
            }
        })
    })
}

const selectable = (row: any) => {

}

const selectionChangeHandle = (val: any) => {

}

// 分页, 每页条数改变
const sizeChangeHandle = (val: any) => {
    data.value.pageSize = val;
    data.value.pageIndex = 1;
    loadCheckInPageData();

}
// 分页, 当前页改变
const currentChangeHandle = (val: any) => {
    data.value.pageIndex = val;
    loadCheckInPageData();
}

// 点击拍照按钮
const takePhotoHandle = () => {
    if (checkinDialog.value.btnText == '拍照') {
        // let video = document.querySelector('#video');
        // let canvas = document.querySelector('#photo');
        let video = videoRef.value;
        let canvas = photoRef.value;

        let context = canvas.getContext('2d');
        // 把摄像头当前的取景内容绘制到canvas控件中
        context.drawImage(video, 0, 0, 470, 300);

        // 显示canvas控件，隐藏两个排他控件
        checkinDialog.value.showEmpty = false;
        checkinDialog.value.showVedio = false;
        checkinDialog.value.showPhoto = true;

        ElMessage.success({
            message: '拍照成功',
            duration: 1200
        });

        // 更新按钮文字和图标
        checkinDialog.value.btnText = '重拍';
        // checkinDialog.value.btnIcon = RefreshRight;
        btnIconRef.value = RefreshRight;
        // 把canvas中的图片转换成base64编码
        checkinDialog.value.dataForm.photo_2 = canvas.toDataURL('image/jpeg');
    } else {
        // 隐藏canvase，显示摄像头取景
        checkinDialog.value.showEmpty = false;
        checkinDialog.value.showVedio = true;
        checkinDialog.value.showPhoto = false;
        // 更新按钮文字和图标
        checkinDialog.value.btnText = '拍照';
        // checkinDialog.value.btnIcon = Camera;
        btnIconRef.value = Camera;
    }
}

// 点击确定，签到请求提交
const dataFormSubmit = () => {
    let json = {
        pid: checkinDialog.value.dataForm.pid,
        name: checkinDialog.value.dataForm.name,
        photo_1: checkinDialog.value.dataForm.photo_1,
        photo_2: checkinDialog.value.dataForm.photo_2
    };

    proxy.$http('/mis/appointment/checkin', 'POST', json, true, resp => {
        if (resp.code == 200) {

            let checkVO = resp.checkinVO

            if (!checkVO.checkinResult) {
                ElNotification({
                    title: '通知消息',
                    message: "签到失败：" + resp.message,
                    type: 'error',
                    duration: 1500
                });
            }

            ElNotification({
                title: '通知消息',
                message: "签到成功，请前往【" + checkVO.place + "】进行体检",
                type: 'success',
                duration: 3000
            });

            // 重置数据，关闭弹窗
            checkinDialog.value.showEmpty = true;
            checkinDialog.value.showVedio = false;
            checkinDialog.value.showPhoto = false;
            // checkinDialog.value.btnIcon = Camera;
            btnIconRef.value = Camera;
            checkinDialog.value.btnText = '拍照';
            checkinDialog.value.dataForm.name = null;
            checkinDialog.value.dataForm.sex = null;
            checkinDialog.value.dataForm.pid = null;
            checkinDialog.value.dataForm.photo_1 = null;
            checkinDialog.value.dataForm.photo_2 = null
            checkinDialog.value.visible = false;

            // 重新加载页面数据
            loadCheckInPageData();
        } else {
            ElNotification({
                title: '通知消息',
                message: "签到失败：" + resp.message,
                type: 'error',
                duration: 1500
            });
        }
    })
}

// 点击获取导引单数据
const guidanceHandle = (appointmentId: any) => {
    guidanceDialog.value.visible = true;

    // 发送请求
    proxy.$http(`/mis/appointment/searchGuidanceInfo/${appointmentId}`, 'GET', null, true, resp => {
        if (resp.code == 200) {
            // 获取返回的引导单数据
            let guidanceData = resp.guidanceInfoVO
            let summaryInfo = guidanceData.summaryInfo;

            guidanceDialog.value.name = summaryInfo.name;
            guidanceDialog.value.sex = summaryInfo.sex;
            guidanceDialog.value.age = summaryInfo.age;
            guidanceDialog.value.pid = summaryInfo.pid;
            guidanceDialog.value.tel = summaryInfo.tel;
            guidanceDialog.value.date = summaryInfo.appointmentDate;
            guidanceDialog.value.desc = summaryInfo.desc == null ? '无' : summaryInfo.desc;

            // 导引单 qrcode
            guidanceDialog.value.qrCodeBase64 = guidanceData.qrcodeBase64;
            // 导引单体检项目
            guidanceDialog.value.checkup = guidanceData.checkup

            console.log("二维码 base64", guidanceData.qrcodeBase64);


            console.log("检查项目", guidanceData.checkup);

        }
    })

}

onMounted(() => {
    loadCheckInPageData();
})


</script>


<style lang="less" scoped>
@import url('customer_checkin.less');

.isCompleted-true {
    color: #67C23A;
}

.isCompleted-false {
    color: #E6A23C;
}

.isCompleted-null {
    color: #F56C6C;
    font-weight: bold;
}
</style>
