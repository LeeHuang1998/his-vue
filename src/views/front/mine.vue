<template>
    <div class="account-container">
        <!-- 个人基本信息 -->
        <div class="info-container">
            <div class="avatar-container">
                <div class="info-avatar">
                    <el-avatar :size="100" shape="circle" :src="user.photo">
                        <el-icon size="60">
                            <UserFilled />
                        </el-icon>
                    </el-avatar>
                    <div class="avatar-operator" @click="showAvatarDialog">
                        <span class="operator-text">更换照片</span>
                    </div>
                </div>
                <p>
                    用户名：{{ user.username }}
                </p>
            </div>

            <div class="detail-container">
                <el-card shadow="never" class="detail-card">
                    <template #header>
                        <div class="card-header">
                            <span>个人信息</span>
                            <el-button link type="primary" :icon="Edit" @click="toUpdateInfo">修改资料</el-button>
                        </div>
                    </template>
                    <div class="card-body">
                        <p>
                            姓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;名：
                            <span>{{ user.name }}</span>
                        </p>
                        <p>
                            性&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;别：
                            <span>{{ user.sex }}</span>
                        </p>
                        <p>
                            邮&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;箱：
                            <span>{{ user.emial }}</span>
                        </p>
                        <p>
                            手机号码：
                            <span>{{ user.tel }}</span>
                            <el-button link type="primary" style="margin-left: 20px; font-size: 15px;"
                                @click="toUpdateTelAndPasswrod('sms')">修改手机号</el-button>
                            <el-button link type="primary" style="margin-left: 20px; font-size: 15px;"
                                @click="toUpdateTelAndPasswrod('password')">修改密码</el-button>
                        </p>
                        <p>
                            创建时间：
                            <span>{{ user.createTime }}</span>
                        </p>
                    </div>
                </el-card>
            </div>
        </div>

        <!-- 地址信息 -->
        <div class="address-container">
            <div class="address-header">
                <nav>
                    <p>地址管理</p>
                </nav>
                <div class="operate">
                    <div class="allChecked">
                        <el-checkbox v-model="checkAllComputed" size="large">
                            <span>全选</span>
                        </el-checkbox>
                    </div>
                    <div class="add-delete">
                        <el-button link type="primary" :icon="Plus" @click="addAddressBtn">添加地址</el-button>
                        <el-button link type="danger" :icon="Delete" @click="deleteAddress(undefined)">批量删除</el-button>
                    </div>

                </div>
            </div>

            <div class="address-list">
                <!-- 在后端通过 sql 排序，条件为 isDefault = true -->
                <el-scrollbar height="450px" v-if="user.addressList.length > 0">
                    <div v-for="address in user.addressList" class="address-item"
                        :class="{ 'checked-address': address.isChecked == true, 'unchecked-address': address.isChecked == false }">
                        <!-- 添加默认标识 -->
                        <div class="default-badge" v-if="address.isDefault"></div>
                        <span class="default-text" v-if="address.isDefault">默认</span>
                        <div class="address-info">
                            <el-checkbox v-model="address.isChecked" :key="address.id" size="large"
                                @change="isChecked(address.id, address.isChecked)"></el-checkbox>
                            <div class="personal-detail">
                                <div class="personal-info">
                                    <span>{{ address.name }}</span>
                                    <span>{{ address.tel }}</span>
                                </div>
                                <div class="dividing-line"></div>
                                <div class="address-detail">
                                    <span>{{ address.province }}</span>
                                    <span v-if="address.city != '' && address.city != null">{{ address.city }}</span>
                                    <span>{{ address.district }}</span>
                                    <span>{{ address.detail }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="personal-opearte">
                            <el-button link type="primary" @click="editAddressBtn(address.id)">编辑</el-button>
                            <el-button link type="primary" :class="{ 'cancle-default': address.isDefault == true }"
                                @click="updateDefault(address.id, address.isDefault)">
                                {{ address.isDefault ? '取消默认' : '设为默认' }}</el-button>
                            <el-button link type="danger" @click="deleteAddress(address.id)">删除</el-button>
                        </div>
                    </div>
                </el-scrollbar>

                <div class="goods-empty" v-else>
                    <el-empty description="无地址信息" :image-size="200">
                        <el-button type="primary" link @click="addAddressBtn">→ 添加地址</el-button>
                    </el-empty>
                </div>

            </div>
        </div>

        <!-- 修改信息弹窗 -->
        <el-dialog v-model="updateInfoDialog.visible" title="修改个人信息" width="400px" :draggable="true" :overflow="true"
            :align-center="true">
            <el-form :model="updateInfoDialog.updateInfoForm" ref="updateInfoFormRef"
                :rules="updateInfoDialog.infoRules" label-position="right" label-width="auto">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="updateInfoDialog.updateInfoForm.username" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="updateInfoDialog.updateInfoForm.name" placeholder="请输入姓名"></el-input>
                </el-form-item>
                <el-form-item label="性别" prop="sex">
                    <el-radio-group v-model="updateInfoDialog.updateInfoForm.sex">
                        <el-radio value="男">男</el-radio>
                        <el-radio value="女">女</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="updateInfoDialog.updateInfoForm.email" placeholder="请输入邮箱"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="updateInfoDialog.visible = false">取消</el-button>
                    <el-button type="primary" @click="updateInfo">
                        确定
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 修改电话弹窗 -->
        <el-dialog v-model="telAndPasswordDialog.visible" :title="telAndPasswordDialog.title" width="400px"
            :draggable="true" :overflow="true" :align-center="true">

            <el-form v-if="telAndPasswordDialog.updateType == 'sms'" :model="telAndPasswordDialog.updateTelForm"
                ref="updateTelFormRef" :rules="telAndPasswordDialog.telRules" label-position="right" label-width="auto">
                <el-form-item label="原手机">
                    <!-- <el-input v-model="user.tel" placeholder="原手机号" disabled></el-input> -->
                    <div class="input-container">
                        <!-- 选择框：v-model 直接绑 areaCode -->
                        <el-select v-model="telAndPasswordDialog.updateTelForm.areaCode" placeholder="区号" disabled
                            popper-class="area-code-popper">
                            <el-option v-for="item in telAndPasswordDialog.areaList" :key="item.code"
                                :value="item.code">
                                <!-- 自定义插槽：左边国家/地区，右边区号 -->
                                <span style="float: left; min-width: 100px;">{{ item.name }}</span>
                                <span style="float: right; color: #999">{{ item.code }}</span>
                            </el-option>
                        </el-select>
                        <el-input v-model="telAndPasswordDialog.updateTelForm.oldTel" placeholder="请输入手机号" disabled
                            oninput="value=value.replace(/[^\d]/g,'')" clearable>
                        </el-input>
                    </div>
                </el-form-item>
                <el-form-item label="新手机" prop="newTel">
                    <!-- <el-input v-model="telAndPasswordDialog.updateTelForm.newTel" placeholder="请输入新手机" clearable></el-input> -->
                    <div class="input-container">
                        <!-- 选择框：v-model 直接绑 areaCode -->
                        <el-select v-model="telAndPasswordDialog.updateTelForm.areaCode" placeholder="区号"
                            popper-class="area-code-popper">
                            <el-option v-for="item in telAndPasswordDialog.areaList" :key="item.code"
                                :value="item.code">
                                <!-- 自定义插槽：左边国家/地区，右边区号 -->
                                <span style="float: left; min-width: 100px;">{{ item.name }}</span>
                                <span style="float: right; color: #999">{{ item.code }}</span>
                            </el-option>
                        </el-select>
                        <el-input v-model="telAndPasswordDialog.updateTelForm.newTel" placeholder="请输入手机号"
                            oninput="value=value.replace(/[^\d]/g,'')" clearable>
                        </el-input>
                    </div>
                </el-form-item>
                <el-form-item label="验证码" prop="code">
                    <div class="code-input">
                        <el-input v-model="telAndPasswordDialog.updateTelForm.code" placeholder="请输入验证码" maxlength="6"
                            clearable></el-input>
                        <el-button class="send-code-btn" @click="sendSmsCode"
                            :disabled="telAndPasswordDialog.timer > 0">{{
                                telAndPasswordDialog.sendCodeBtnText
                            }}</el-button>
                    </div>
                </el-form-item>
            </el-form>

            <el-form v-if="telAndPasswordDialog.updateType == 'password'"
                :model="telAndPasswordDialog.updatePasswordForm" ref="updatePasswordFormRef"
                :rules="telAndPasswordDialog.passwordRules" label-position="right" label-width="auto">
                <el-form-item label="原密码" prop="oldPassword">
                    <el-input v-model="telAndPasswordDialog.updatePasswordForm.oldPassword" placeholder="请输入原密码"
                        clearable type="password" :show-password="true"></el-input>
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                    <el-input v-model="telAndPasswordDialog.updatePasswordForm.newPassword" placeholder="请输入新密码"
                        clearable type="password" :show-password="true"></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input v-model="telAndPasswordDialog.updatePasswordForm.confirmPassword" placeholder="请确认新密码"
                        clearable type="password" :show-password="true"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="telAndPasswordDialog.visible = false">取消</el-button>
                    <el-button type="primary" @click="updateTelOrPassword">
                        确定
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 地址信息弹窗 -->
        <el-dialog v-model="addressDialog.visible" :title="addressDialog.addressForm.id ? '编辑地址' : '添加地址'" width="400px"
            :draggable="true" :overflow="true" :align-center="true">
            <el-form :model="addressDialog.addressForm" ref="addressFormRef" :rules="addressDialog.addressRules"
                label-position="right" label-width="auto">
                <el-form-item label="收货人" prop="name">
                    <el-input v-model="addressDialog.addressForm.name" placeholder="请输入收货人姓名"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="tel">
                    <el-input v-model="addressDialog.addressForm.tel" placeholder="请输入收货人手机号" maxlength="11"></el-input>
                </el-form-item>
                <el-form-item label="所在地区" prop="regionCode">
                    <!-- :props="{ expandTrigger: 'click' }" 表示点击当前项才展开下一级 -->
                    <el-cascader v-model="addressDialog.addressForm.regionCode" :options="options" class="el-input"
                        :props="{ expandTrigger: 'click' }" placeholder="请选择省/市/区" clearable
                        @change="onAddressChange" />
                </el-form-item>
                <el-form-item label="详细地址" prop="detail">
                    <el-input type="textarea" v-model="addressDialog.addressForm.detail"
                        placeholder="请输入详细地址"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="addressDialog.visible = false">取消</el-button>
                    <el-button type="primary" @click="saveAddress">
                        确定
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 照片上传弹窗 -->
        <el-dialog v-model="avatarDialog.visible" title="更换照片" width="700px" :draggable="true" :align-center="true">
            <div class="avatar-upload-container">
                <!-- 原照片显示 -->
                <div class="original-avatar">
                    <h4>原照片</h4>
                    <div class="avatar-content">
                        <el-avatar :size="100" shape="circle" :src="user.photo">
                            <el-icon size="60">
                                <UserFilled />
                            </el-icon>
                        </el-avatar>
                        <p class="upload-hint">点击下方区域更换图片</p>
                    </div>
                </div>

                <!-- 裁剪区域 -->
                <!-- @crop-end：裁剪结束事件，@crop-change：裁剪框变化事件 -->
                <div class="crop-container" v-if="avatarDialog.cropperVisible">
                    <div class="crop-area" @mouseup="onCropEnd">
                        <VueCropper ref="cropperRef" :img="avatarDialog.imgSrc" :outputSize="avatarDialog.outputSize"
                            :outputType="avatarDialog.outputType" :info="avatarDialog.info" :full="avatarDialog.full"
                            :canScale="avatarDialog.canScale" :canMove="avatarDialog.canMove"
                            :canMoveBox="avatarDialog.canMoveBox" :original="avatarDialog.original"
                            :autoCrop="avatarDialog.autoCrop" :autoCropWidth="avatarDialog.autoCropWidth"
                            :autoCropHeight="avatarDialog.autoCropHeight" :fixed="avatarDialog.fixed"
                            :fixedNumber="avatarDialog.fixedNumber" :limitMinSize="avatarDialog.limitMinSize"
                            :centerBox="avatarDialog.centerBox" :infoTrue="avatarDialog.infoTrue"
                            :fixedBox="avatarDialog.fixedBox" :mode="avatarDialog.mode" :realTime="false"
                            @crop-end="onCropEnd" @crop-change="onCropChange" />
                    </div>

                    <!-- 预览区域 - 完全匹配 el-avatar 样式 -->
                    <div class="preview-container">
                        <h4>预览效果</h4>
                        <div class="preview-box">
                            <!-- 使用与页面中完全相同的 el-avatar 组件 -->
                            <el-avatar :size="100" shape="circle" :src="previews.url || user.photo">
                                <el-icon size="60" v-if="!previews.url && !user.photo">
                                    <UserFilled />
                                </el-icon>
                            </el-avatar>
                        </div>
                        <p class="preview-text">预览尺寸: 100×100 圆形</p>
                        <!-- 添加提示信息 -->
                        <p class="preview-hint" style="font-size: 12px; color: #67C23A; margin-top: 5px;">
                            预览会在裁剪完成后更新
                        </p>
                    </div>
                </div>

                <!-- 上传区域 -->
                <div class="upload-area" v-if="!avatarDialog.cropperVisible">
                    <div class="upload-placeholder" @click="triggerFileInput" @dragover="handleDragover"
                        @drop="handleDrop">
                        <div class="upload-avatar-preview">
                            <el-icon size="40">
                                <Plus />
                            </el-icon>
                        </div>
                        <p>点击或拖拽图片到此处</p>
                        <p class="upload-tip">支持 JPG、PNG 格式，大小不超过 5MB</p>
                        <p class="upload-tip">推荐尺寸: 100×100 像素</p>
                    </div>
                    <input type="file" ref="fileInputRef" style="display: none" accept="image/jpeg,image/png"
                        @change="handleFileChange" />
                </div>
            </div>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="avatarDialog.visible = false">取消</el-button>
                    <el-button v-if="avatarDialog.cropperVisible" @click="resetAvatarUpload">重新选择</el-button>
                    <el-button v-if="avatarDialog.cropperVisible" type="primary" @click="uploadAvatar">保存照片</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import { ref, getCurrentInstance, onMounted, computed } from 'vue';
import { Edit, Plus, Delete } from '@element-plus/icons-vue';

// 图片裁剪组件
import { VueCropper } from 'vue-cropper';
import 'vue-cropper/dist/index.css';

import { regionData, codeToText } from 'element-china-area-data'

import router from '../../router/index';
import { ElMessage, ElMessageBox } from 'element-plus';
import { cookieUtil } from '../../utils/CookieUtil';
import { isBlank, isMobile } from '../../utils/validate';

const { proxy } = getCurrentInstance() as any;

const user = ref({
    id: 1,
    username: '',
    name: "",
    sex: "",
    tel: "",
    emial: '',
    photo: null,
    addressList: [],
    selectedAddress: [],
    createTime: ""
});

/* -----------------------------------------------------------------------------------------------------  */
// 照片上传弹窗相关
const avatarDialog = ref({
    visible: false,
    cropperVisible: false,
    imgSrc: '',                             // 头像地址
    outputSize: 1,                          // 裁剪生成图片的质量
    outputType: 'png',                      // 裁剪生成图片的格式
    full: false,                            // 是否输出原图比例的截图
    canScale: true,                         // 上传图片是否可以缩放    
    canMove: true,                          // 上传图片是否可以移动
    canMoveBox: true,                       // 截图框能否拖动
    original: false,                        // 上传图片按照原始比例渲染
    autoCrop: true,                         // 确保自动生成裁剪框
    autoCropWidth: 200,                     // 自动裁剪区域宽度
    autoCropHeight: 200,                    // 自动裁剪区域高度
    fixed: true,                            // 开启固定宽高比例
    fixedNumber: [1, 1],                    // 宽高比例 1:1
    limitMinSize: 80,                       // 截图框最小限制
    fixedBox: false,                        // 允许调整裁剪框大小
    centerBox: true,                        // 截图框是否被限制在图片里面
    info: true,                             // 显示裁剪信息
    infoTrue: true,                         // 显示真实输出图片宽高
    mode: 'cover',                          // 图片默认渲染方式
    realTime: false,                        // 关闭实时预览
});

// 图片裁剪组件
const cropperRef = ref();
// 图片上传组件
const fileInputRef = ref();
// 图片预览数据
const previews = ref({
    url: '',
    w: 0,
    h: 0
});

// 定时器，用于防抖
let mouseUpTimer: NodeJS.Timeout | null = null;

// 裁剪结束时的处理函数
const onCropEnd = () => {
    // 清除之前的定时器
    if (mouseUpTimer) {
        clearTimeout(mouseUpTimer);
    }
    // 延迟一小段时间确保操作完全结束
    mouseUpTimer = setTimeout(() => {
        updatePreview();
    }, 50);
};

//裁剪变化事件处理
const onCropChange = () => {
};

// 手动更新预览
const updatePreview = () => {
    if (cropperRef.value) {
        cropperRef.value.getCropData((data: string) => {
            if (data && data !== previews.value.url) {
                previews.value.url = data;
            }
        });
    }
};

// 处理拖拽悬停
const handleDragover = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
};

// 处理拖拽放下
const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
        validateAndLoadImage(files[0]);
    }
};

// 显示照片上传弹窗
const showAvatarDialog = () => {
    avatarDialog.value.visible = true;
    avatarDialog.value.cropperVisible = false;
    avatarDialog.value.imgSrc = '';
};

// 触发文件选择
const triggerFileInput = () => {
    fileInputRef.value?.click();
};

// 处理文件选择
const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
        validateAndLoadImage(file);
    }
    // 清空input，允许重复选择同一文件
    target.value = '';
};


// 验证并加载图片
const validateAndLoadImage = (file: File) => {
    // 检查文件类型
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
        ElMessage.error('请选择 JPG 或 PNG 格式的图片');
        return;
    }

    // 检查文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        ElMessage.error('图片大小不能超过 5MB');
        return;
    }

    // 重置预览数据
    previews.value = {
        url: '',
        w: 0,
        h: 0
    };

    // 创建文件阅读器
    const reader = new FileReader();
    reader.onload = (e) => {
        const result = e.target?.result as string;
        avatarDialog.value.imgSrc = result;
        avatarDialog.value.cropperVisible = true;

        // 下一帧初始化裁剪器
        proxy.$nextTick(() => {
            if (cropperRef.value) {
                // 先刷新裁剪器
                cropperRef.value.refresh();

                // 延迟确保DOM更新完成
                setTimeout(() => {
                    // 执行自动裁剪
                    cropperRef.value.goAutoCrop();

                    // 预览更新
                    setTimeout(() => {
                        updatePreview();
                    }, 300);
                }, 200);
            }
        });
    };

    reader.onerror = (error) => {
        console.error('文件读取错误:', error);
        ElMessage.error('图片读取失败，请重试');
    };
    reader.readAsDataURL(file);
};

// 重置照片上传
const resetAvatarUpload = () => {
    avatarDialog.value.cropperVisible = false;
    avatarDialog.value.imgSrc = '';
    previews.value = {
        url: '',
        w: 0,
        h: 0
    };

    // 清除所有定时器
    if (mouseUpTimer) {
        clearTimeout(mouseUpTimer);
        mouseUpTimer = null;
    }
};

// 上传照片
const uploadAvatar = () => {
    if (!cropperRef.value) {
        ElMessage.error('裁剪器未初始化');
        return;
    }

    try {
        // 获取裁剪后的图片 blob
        cropperRef.value.getCropBlob((blob: Blob) => {
            if (!blob) {
                ElMessage.error('获取裁剪图片失败');
                return;
            }

            const formData = new FormData();
            formData.append('file', blob, `avatar_${user.value.id}.png`);
            if (user.value.photo != null) {
                formData.append('oldPath', user.value.photo);
            } else {
                formData.append('oldPath', '');
            }

            // 上传照片
            proxy.$upload('/front/customer/updateAvatar', formData, true, (resp: any) => {

                console.log(resp);

                if (resp.code === 200) {
                    ElMessage.success({
                        message: resp.msg,
                        duration: 1500
                    });
                    // // 更新本地照片显示
                    // if (resp.result && resp.result.photoUrl) {
                    //     user.value.photo = resp.result.photoUrl;
                    // }

                    // 关闭弹窗并重置状态
                    avatarDialog.value.visible = false;
                    resetAvatarUpload();

                    // 重新获取用户信息
                    getCustomerInfo();

                } else {
                    ElMessage.error({
                        message: resp.msg,
                        duration: 1500
                    });
                }
            });
        });
    } catch (error) {
        console.error('上传照片错误:', error);
        ElMessage.error('上传照片失败');
    }
};

/*----------------------------------------------------------------------------------------- */
const validateConfirmPassword = (rule, value, callback) => {
    if (value !== telAndPasswordDialog.value.updatePasswordForm.newPassword) {
        callback(new Error('两次输入的密码不一致'))
    } else {
        callback()
    }
}

// 修改手机弹窗
const telAndPasswordDialog = ref({
    visible: false,
    updateType: 'sms',
    title: '修改手机号码',
    sendCodeBtnText: '发送验证码',
    timer: 0,
    updateTelForm: {
        oldTel: user.value.tel,
        newTel: '',
        code: '',
        areaCode: '+0086', // 默认区号
    },
    areaList: [
        { name: '中国大陆', code: '+0086' },
        { name: '中国香港', code: '+0852' },
        { name: '中国澳门', code: '+0853' },
        { name: '中国台湾', code: '+0886' },
        { name: '美国', code: '+0001' }
    ],
    updatePasswordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    },
    telRules: {
        newTel: [
            { required: true, message: '请输入手机号码', trigger: 'blur' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        code: [
            { required: true, message: '请输入验证码', trigger: 'blur' },
            { min: 6, max: 6, message: '验证码长度为6位', trigger: 'blur' }
        ]
    },
    passwordRules: {
        oldPassword: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 18, message: '密码长度为6-18个字符', trigger: 'blur' }
        ],
        newPassword: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 18, message: '密码长度为6-18个字符', trigger: 'blur' }
        ],
        confirmPassword: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { validator: validateConfirmPassword, trigger: 'blur' }
        ]
    }
})

// 修改用户信息弹窗
const updateInfoDialog = ref({
    visible: false,
    updateInfoForm: {
        username: cookieUtil.getFrontendUser()?.username,
        name: user.value.name,
        sex: user.value.sex,
        email: user.value.emial
    },
    infoRules: {
        username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 12, message: '用户名长度为 3-15 个字符', trigger: 'blur' },
            { pattern: /^[a-zA-Z0-9_-]{3,15}$/, message: '用户名格式不正确', trigger: 'blur' }
        ],
        name: [
            { required: true, message: '请输入姓名', trigger: 'blur' },
            { pattern: /^[\u4e00-\u9fa5A-Za-z·\s]{2,30}$/, message: '姓名格式不正确', trigger: 'blur' }
        ],
        sex: [
            { required: true, message: '请选择性别', trigger: 'change' },
            { pattern: /^(男|女)$/, message: '性别只能为“男”或“女”', trigger: 'change' }
        ],
        email: [
            { pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', message: '请输入正确的邮箱', trigger: 'blur' }
        ]
    }
})

// 地址表单
const addressDialog = ref({
    visible: false,
    addressForm: {
        id: null,
        province: '',
        city: '',
        district: '',
        detail: '',
        name: '',
        tel: '',
        regionCode: [],
        isDefault: false
    },
    addressRules: {
        name: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 2, max: 20, message: '名字长度为2-20个字符', trigger: 'blur' }
        ],
        tel: [
            { required: true, message: '请输入手机号码', trigger: 'blur' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        regionCode: [
            {
                required: true,
                validator: (_rule: any, value: string[], callback: Function) => {
                    if (!value || value.length !== 3) {
                        callback(new Error('请选择完整的省-市-区'))
                    } else {
                        callback()
                    }
                },
                trigger: ['blur', 'change']   // 失焦或选择后都触发
            }
        ],
        detail: [
            { required: true, message: '请输入详细地址', trigger: 'blur' },
            { min: 1, max: 70, message: '详细地址长度为 1-70 个字符', trigger: 'blur' }
        ]
    }
});

// element-ui 省市区选择器数据源
const options = regionData

// 将省市区赋值给表单
const onAddressChange = (codeArr: string[]) => {
    if (!codeArr || codeArr.length !== 3) {
        return
    }
    const [p, c, d] = codeArr
    const f = addressDialog.value.addressForm
    f.regionCode = codeArr        // 同步给表单字段，触发校验
    f.province = codeToText[p]
    f.city = ['市辖区', '县'].includes(codeToText[c]) ? '' : codeToText[c]
    f.district = codeToText[d]
}

// 添加地址按鈕
const addAddressBtn = () => {

    addressDialog.value.addressForm.id = null;
    addressDialog.value.addressForm.name = '';
    addressDialog.value.addressForm.tel = '';
    addressDialog.value.addressForm.province = '';
    addressDialog.value.addressForm.city = '';
    addressDialog.value.addressForm.district = '';
    addressDialog.value.addressForm.detail = '';
    addressDialog.value.addressForm.regionCode = [];
    addressDialog.value.addressForm.isDefault = false;
    addressDialog.value.visible = true;

    proxy.$nextTick(() => {
        proxy.$refs['addressFormRef'].clearValidate()
    })
}

// 編輯地址按鈕
const editAddressBtn = (id: number) => {

    addressDialog.value.visible = false;

    const addr = user.value.addressList.find(i => i.id === id)!

    // 2. 回显表单
    addressDialog.value.addressForm = {
        ...addr
    }

    addressDialog.value.visible = true
}

// 全选和反选
const checkAllComputed = computed({
    // 当所有 address.isChecked 为 true 时返回 true
    get() {
        return user.value.addressList.length > 0 &&
            user.value.addressList.every(addr => addr.isChecked)
    },
    // 点击全选框时触发，将所有地址的 isChecked 设置为 val
    set(val: boolean) {
        user.value.addressList.forEach(address => {
            address.isChecked = val
            user.value.selectedAddress.push(address.id)
        })
    }
})


// 勾选中地址
const isChecked = (id: number, checked: boolean) => {
    if (checked) {
        user.value.selectedAddress.push(id)
        console.log("被选中的：", user.value.selectedAddress);
    } else {
        user.value.selectedAddress = user.value.selectedAddress.filter(i => i !== id)
    }
}

// 批量删除     TODO：发送请求到后端重新查询，异步执行
const deleteAddress = (id: number | undefined) => {
    let ids = id == undefined ? user.value.selectedAddress.map(item => item) : [id]

    if (ids.length == 0) {
        ElMessage.error({
            message: '没有地址被选中',
            duration: 1200
        })
        return
    }

    ElMessageBox.confirm('确定要删除选中的数据吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {

        let idsJson = {
            ids: ids
        }

        proxy.$http('/front/customer/mine/address/deleteAddress', 'DELETE', idsJson, false, resp => {
            if (resp.code == 200) {
                ElMessage.success({
                    message: resp.msg,
                    duration: 1200
                })
                getCustomerInfo()
            } else {
                ElMessage.error({
                    message: resp.msg,
                    duration: 1500
                })
            }
        })
    })
}

// 设为默认
const updateDefault = (id: string, status: boolean) => {

    let defaultStatus = {
        id: id,
        isDefault: !status
    }

    // 发送请求
    proxy.$http('/front/customer/mine/address/updateAddressDefault', 'PATCH', defaultStatus, true, resp => {
        if (resp.code == 200) {
            ElMessage.success({
                message: resp.msg,
                duration: 1200
            })
            // 刷新页面
            getCustomerInfo()
        } else {
            ElMessage.error({
                message: resp.msg,
                duration: 1500
            })
        }
    })
}

// 新增或更新地址
const saveAddress = () => {
    proxy.$refs['addressFormRef'].validate((valid: boolean) => {
        // 判断当前是添加还是编辑
        if (valid) {

            let opeartorUrl = addressDialog.value.addressForm.id == null
                ? '/front/customer/mine/address/insertAddress'
                : '/front/customer/mine/address/updateAddress'

            let method = addressDialog.value.addressForm.id == null ? 'POST' : 'PUT'

            let addressJson = {
                id: addressDialog.value.addressForm.id,
                name: addressDialog.value.addressForm.name,
                tel: addressDialog.value.addressForm.tel,
                province: addressDialog.value.addressForm.province,
                city: addressDialog.value.addressForm.city,
                district: addressDialog.value.addressForm.district,
                detail: addressDialog.value.addressForm.detail,
                regionCode: addressDialog.value.addressForm.regionCode,
            }

            proxy.$http(opeartorUrl, method, addressJson, false, resp => {
                if (resp.code == 200) {
                    ElMessage.success({
                        message: resp.msg,
                        duration: 1200
                    })
                    // 关闭弹窗并刷新页面
                    addressDialog.value.visible = false
                    // 重置被选中的数据
                    getCustomerInfo()
                } else {
                    ElMessage.error({
                        message: resp.msg,
                        duration: 1500
                    })
                }
            })
        }
    })
}

// 发送验证码
const sendSmsCode = () => {

    let newTel = telAndPasswordDialog.value.updateTelForm.newTel
    let areaCode = '+0086'

    if (isBlank(newTel)) {
        ElMessage.error({
            message: '请填写手机号码',
            duration: 1000
        });
    } else if (!isMobile(newTel)) {
        ElMessage.error({
            message: '手机号码错误',
            duration: 1000
        });
    } else {

        let phone = {
            phoneNum: newTel,
            areaCode: areaCode
        }

        // 发送请求
        proxy.$http('/front/customer/sendSmsCode', 'POST', phone, true, resp => {
            if (resp.result) {
                ElMessage.success({
                    message: resp.msg,
                    duration: 1000
                })

                // 设置倒计时
                telAndPasswordDialog.value.timer = 60;
                let timer = setInterval(function () {
                    telAndPasswordDialog.value.timer--;
                    telAndPasswordDialog.value.sendCodeBtnText = `重新获取(${telAndPasswordDialog.value.timer}秒)`;
                    if (telAndPasswordDialog.value.timer == 0) {
                        clearInterval(timer);
                        telAndPasswordDialog.value.sendCodeBtnText = '获取短信验证码';
                    }
                }, 1000);
            } else if (resp.code == 200 && !resp.result) {
                const sec = Number(resp.msg)     // 捕获数字部分

                ElMessage.info({
                    message: "请勿频繁发送短信",
                    duration: 1000
                })

                if (sec !== 0) {
                    telAndPasswordDialog.value.timer = sec
                    let timer = setInterval(function () {
                        telAndPasswordDialog.value.timer--;
                        telAndPasswordDialog.value.sendCodeBtnText = `重新获取(${telAndPasswordDialog.value.timer}秒)`;
                        if (telAndPasswordDialog.value.timer == 0) {
                            clearInterval(timer);
                            telAndPasswordDialog.value.sendCodeBtnText = '获取短信验证码';
                        }
                    }, 1000);
                }
            } else {
                ElMessage.error({
                    message: resp.msg,
                    duration: 1500
                })
            }
        })
    }
}

// 打开修改手机号和密码弹窗
const toUpdateTelAndPasswrod = (updateType: string) => {

    telAndPasswordDialog.value.updateType = updateType
    if (updateType == 'sms') {
        telAndPasswordDialog.value.title = '修改手机号'
    } else if (updateType == 'password') {
        telAndPasswordDialog.value.title = '修改密码'
    } else {
        return
    }


    // 重置表单数据
    telAndPasswordDialog.value.updateTelForm.oldTel = user.value.tel
    telAndPasswordDialog.value.updateTelForm.newTel = ''
    telAndPasswordDialog.value.updateTelForm.code = ''

    telAndPasswordDialog.value.updatePasswordForm.newPassword = ''
    telAndPasswordDialog.value.updatePasswordForm.oldPassword = ''
    telAndPasswordDialog.value.updatePasswordForm.confirmPassword = ''

    telAndPasswordDialog.value.visible = true

    proxy.$nextTick(() => {
        if (updateType == 'sms') {
            proxy.$refs['updateTelFormRef'].clearValidate()
        } else if (updateType == 'password') {
            proxy.$refs['updatePasswordFormRef'].clearValidate()
        }
    })
}

// 修改手机号或密码
const updateTelOrPassword = () => {
    // 获取当前的修改类型
    let updateType = telAndPasswordDialog.value.updateType

    let form = ''
    let identity = null
    let credential = null

    if (updateType == 'sms') {
        form = 'updateTelFormRef'
        identity = telAndPasswordDialog.value.updateTelForm.newTel
        credential = telAndPasswordDialog.value.updateTelForm.code
    } else if (updateType == 'password') {
        form = 'updatePasswordFormRef'
        identity = telAndPasswordDialog.value.updatePasswordForm.oldPassword
        credential = telAndPasswordDialog.value.updatePasswordForm.newPassword
    }

    // 发送请求登录
    proxy.$refs[form].validate((valid: boolean) => {
        if (valid) {
            let updateJson = {
                type: updateType,
                identity: identity,
                credential: credential,
                areaCode: telAndPasswordDialog.value.updateTelForm.areaCode
            }

            proxy.$http('/front/customer/updateTelOrPassword', 'POST', updateJson, true, resp => {
                console.log(resp);

                if (resp.code === 200) {
                    ElMessage.success({
                        message: resp.msg,
                        duration: 1500
                    })
                    // 关闭弹窗，重新加载页面
                    telAndPasswordDialog.value.timer = 0
                    telAndPasswordDialog.value.visible = false
                    getCustomerInfo()
                } else {
                    ElMessage.error({
                        message: resp.msg,
                        duration: 1500
                    })
                }
            })
        }
    })
}


// 打开修改用户信息窗口
const toUpdateInfo = () => {
    updateInfoDialog.value.visible = true

    updateInfoDialog.value.updateInfoForm.username = user.value.username
    updateInfoDialog.value.updateInfoForm.name = user.value.name
    updateInfoDialog.value.updateInfoForm.sex = user.value.sex
    updateInfoDialog.value.updateInfoForm.email = user.value.emial

    proxy.$nextTick(() => {
        proxy.$refs['updateInfoFormRef'].clearValidate()
    })
}

// 更新用户信息请求
const updateInfo = () => {
    proxy.$refs['updateInfoFormRef'].validate((valid: boolean) => {
        if (valid) {
            let customerInfoJSON = {
                username: updateInfoDialog.value.updateInfoForm.username,
                name: updateInfoDialog.value.updateInfoForm.name,
                sex: updateInfoDialog.value.updateInfoForm.sex,
                email: updateInfoDialog.value.updateInfoForm.email
            }
            proxy.$http('/front/customer/updateCustomerInfo', 'POST', customerInfoJSON, true, resp => {
                if (resp.code === 200) {
                    ElMessage.success({
                        message: resp.msg,
                        duration: 1500
                    })
                    // 关闭弹窗，重新加载页面
                    getCustomerInfo()
                    updateInfoDialog.value.visible = false
                } else {
                    ElMessage.error({
                        message: resp.msg,
                        duration: 1500
                    })
                }
            })
        }
    })
}

// 获取页面数据
const getCustomerInfo = () => {
    proxy.$http('/front/customer/getCustomerInfo', 'GET', null, true, resp => {
        if (resp.code === 200) {
            console.log(resp);
            
            let customer = resp.customerInfo

            user.value.id = customer.id;
            user.value.username = customer.username == null ? '未设置' : customer.username;
            user.value.name = customer.name == null ? '未设置' : customer.name;
            user.value.sex = customer.sex == null ? '未设置' : customer.sex;
            user.value.tel = customer.tel;
            user.value.emial = customer.email == null ? '未设置' : customer.email;
            user.value.photo = customer.photo;
            user.value.createTime = customer.createTime;

            user.value.addressList = []

            customer.addressList.forEach(address => {
                address.isChecked = false
                user.value.addressList.push(address)
            })

            user.value.selectedAddress = []
        }
    })
}

getCustomerInfo()

</script>

<style lang="less" scoped>
@import url("mine.less");

// 照片上传相关样式
.avatar-upload-container {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .original-avatar {
        text-align: center;
        padding: 10px;
        border-bottom: 1px solid #e4e7ed;

        h4 {
            margin-bottom: 10px;
            color: #606266;
        }

        .avatar-content {
            /* ← 新增样式 */
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            /* 控制照片和文字之间的间距 */
        }

        .upload-hint {
            font-size: 12px;
            color: #909399;
            background: rgba(0, 0, 0, 0.6);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
            margin: 0;
            /* 确保没有额外边距 */
        }
    }

    .crop-container {
        display: flex;
        gap: 30px;
        align-items: flex-start;

        .crop-area {
            flex: 1;
            height: 350px;

            :deep(.vue-cropper) {
                height: 100%;
                background: #f8f9fa;
                border-radius: 8px;
                border: 1px solid #e4e7ed;

                .cropper-view-box {
                    outline: 2px solid #409EFF;
                    outline-color: rgba(64, 158, 255, 0.8);
                }

                .cropper-face {
                    background-color: transparent;
                }

                .cropper-point {
                    background-color: #409EFF;
                    width: 8px;
                    height: 8px;
                    opacity: 0.75;
                }
            }
        }

        .preview-container {
            width: 150px;
            text-align: center;

            h4 {
                margin-bottom: 15px;
                color: #606266;
            }

            .preview-box {
                display: flex;
                justify-content: center;
                margin-bottom: 10px;

                :deep(.el-avatar) {
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    border: 2px solid #f0f0f0;
                    transition: all 0.3s ease;
                }
            }

            .preview-text {
                font-size: 12px;
                color: #909399;
                margin-bottom: 5px;
            }

            .preview-debug {
                font-size: 10px;
                color: #ccc;
            }
        }
    }

    .upload-area {
        .upload-placeholder {
            height: 200px;
            border: 2px dashed #dcdfe6;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            transition: all 0.3s;
            background-color: #fafafa;

            &:hover {
                border-color: #409EFF;
                background-color: #f0f7ff;
            }

            .upload-avatar-preview {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #f0f0f0;
                margin-bottom: 15px;
                transition: all 0.3s;

                .el-icon {
                    color: #c0c4cc;
                    font-size: 32px;
                    transition: all 0.3s;
                }
            }

            &:hover .upload-avatar-preview {
                background-color: #e6f7ff;

                .el-icon {
                    color: #409EFF;
                }
            }

            p {
                margin: 5px 0;
                color: #606266;
            }

            .upload-tip {
                font-size: 12px;
                color: #909399;
            }
        }
    }
}

// 响应式调整
@media (max-width: 768px) {
    .crop-container {
        flex-direction: column;

        .preview-container {
            width: 100%;

            .preview-box {
                justify-content: center;
            }
        }
    }
}
</style>