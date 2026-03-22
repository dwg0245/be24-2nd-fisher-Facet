<script setup>
import { ref, computed} from 'vue';
import { useRewardStore } from '@/stores/rewardStore'; // 1. 스토어 불러오기
import { useRouter } from 'vue-router'
import api from '@/api/funding/index'
import PortOne from "@portone/browser-sdk/v2"
import { useAuthStore } from '@/stores/useAuthStore'


// ------ 스토어 인스턴스 생성 --------
const rewardStore = useRewardStore();
const router = useRouter()
const authStore = useAuthStore()

// 선택된 리워드 데이터 가져오기 (반응형 유지를 위해 computed 권장)
const selectedRewards = computed(() => rewardStore.selectedRewards);
const finalPrice = computed(() => rewardStore.totalPrice);
const productIdx = computed(() => rewardStore.productIdx);
  console.log("피니아 후",productIdx.value)

// 만약 리워드 없이 주소로 바로 들어온 경우를 대비한 안전장치
if (selectedRewards.value.length === 0) {
    router.push({ name: 'funding_list' });
}

// 상태 관리 (State)
const extraSupport = ref(0);       // 추가 후원금
const supportError = ref('');      // 후원금 에러 메시지
const shippingMode = ref('recent');
const isAgreed = ref(false);
const shippingRequest = ref('');

// 결제 관련 상태
const paymentType = ref('easy');
const paymentMethod = ref('card');

const isPaymentProcessing = ref(false) // 결제가 진행 중인지 확인 (중복 클릭 방지)

const paymentStatus = ref({    // 결제 성공/실패 상태와 메시지를 저장
    status: "",
    message: ""
});

// 사용자 정보
const shippingInfo = ref({
    name: '홍길동',
    phone: '010-1234-5678',
    postcode: '12345',
    address: '서울특별시 강남구 테헤란로 123',
    detail: '4층'
});

// 금액 계산 (Computed)
const rewardAmount = finalPrice.value;
const shippingFee = 3000;
const totalAmount = computed(() => {
    return rewardAmount + shippingFee + (Number(extraSupport.value) || 0);
});

// 이벤트 핸들러 (Methods)
const setShippingMode = (mode) => (shippingMode.value = mode);
const setPaymentType = (type) => (paymentType.value = type);
const setPaymentMethod = (method) => (paymentMethod.value = method);


// 후원금 유효성 검사 로직
const validateSupportAmount = () => {
    const amount = extraSupport.value;

    if (amount < 0) {
        supportError.value = '후원금은 0원 이상이어야 합니다.';
        extraSupport.value = 0;
    } else if (amount % 1000 !== 0) {
        supportError.value = '후원금은 1,000원 단위로 입력해주세요.';
    } else {
        supportError.value = ''; // 정상 입력 시 에러 메시지 삭제
    }
};

// 결제 금액 버튼 생성
const handlePayment = async () => {
    if (supportError.value) {
        alert('후원금액을 다시 확인해주세요.');
        return;
    }
    if (!isAgreed.value) {
        alert('동의 사항에 체크해주세요.');
        return;
    }
    // alert(`${totalAmount.value.toLocaleString()}원 결제가 예약되었습니다!`);

    await onPayment()
};


// 포트원 
const onPayment = async () => {
    if (selectedRewards.length === 0) return // 선택한 상품이 없으면 중단
    if (isPaymentProcessing.value) return // 이미 결제 중이면 중단

    isPaymentProcessing.value = true // 결제 프로세스 시작 알림
    paymentStatus.value = { status: "", message: "" }

    let ordersIdx = null // 서버에서 생성된 주문 번호를 담을 변수

    try {

        // 주문 이름 만들기 (ex: "반지 외 2건")
        const firstItem = selectedRewards.value[0]
        const orderName = selectedRewards.value.length === 1
            ? firstItem.title
            : `${firstItem.title} 외 ${selectedRewards.value.length - 1}건`

        const ordersItemsList = selectedRewards.value.map(item => ({
            productIdx: item.idx,
            quantity: item.quantity
        }))

        const orderDto = ({
            productIdx: productIdx.value,
            price: totalAmount.value,
            ordersItems: ordersItemsList
        });

        // 1단계: 우리 서버(Spring)에 "이 상품들 주문할 거야"라고 미리 알리고 주문 DB를 만듭니다.
        const createResponse = await api.fundOrders(orderDto)
        console.log(createResponse.idx)
        // 서버가 생성해준 주문 PK(ordersIdx)를 받아옵니다.
        ordersIdx = createResponse.idx

        // 현재 시간을 가져와서 특수문자(-, :, .)를 다 제거하는 방식
        const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
        const shortUuid = crypto.randomUUID().split('-')[0];

        // 2단계: 실제 포트원 결제창을 띄웁니다.
        const payment = await PortOne.requestPayment({
            storeId: import.meta.env.VITE_PAYMENT_STOREID,   // 내 상점 식별자
            channelKey: import.meta.env.VITE_PATMENT_CHANNELKEY, // 결제 채널(카카오페이 등) 키
            paymentId: `facet_${timestamp}_${shortUuid}`, // 이번 결제의 고유 번호, 결과: facet_20260319004654_a1b2c3d4
            orderName: orderName,      // 결제창에 뜰 이름
            totalAmount: totalAmount.value, // 결제할 금액
            currency: 'CURRENCY_KRW',           // 통화 (원화)
            payMethod: "CARD",         // 결제 수단 (카드)
            customData: { ordersIdx, ordersItemsList } // 나중에 확인용으로 담아두는 추가 데이터
        }).then((res) => {
            return res; // 결제 시도 후 결과 반환
        }).catch((error) => {
            // 결제창 자체가 안 뜨거나 에러 났을 때 처리
            paymentStatus.value = { status: "FAILED", message: '결제 시도가 실패하였습니다.' }
        });

        // 3단계: 결제 검증 (서버에 "실제로 돈이 들어왔는지 확인해줘"라고 요청)
        // 결제가 끝나면 포트원에서 준 paymentId를 우리 서버로 보내서 2차 확인을 합니다.
        const paymentId = ({
            paymentId: payment.paymentId
        })

        const verifyResponse = await api.verifyOrders(paymentId)


        if (verifyResponse.code === 2002) { // 결제 성공
            router.push({ name: 'shipping' });
            clearData();
        } else { // 결제 실패 
            if (verifyResponse.code === 4109) { // 본인의 주문만 결제 가능합니다
                alert("인증 정보가 일치하지 않습니다. 보안을 위해 다시 로그인해주세요.")
                try {
                    // 쿠키 삭제를 위한 백엔드 통신
                    const res = await api.logout()
                } catch (error) {
                    console.error("Logout communication failed:", error);
                } finally {
                    authStore.logout();
                    router.push({ name: 'login' });
                    clearData()
                }
            }
            else if (verifyResponse.code === 4106) { // 유저를 찾을 수 없습니다.
                alert("유저를 찾을 수 없습니다. 다시 로그인해주세요.")
                router.push({ name: 'login' });
                clearData();
            }
            else if (verifyResponse.code === 4203) { // 리워드를 찾을 수 없습니다. 
                alert("해당 리워드 상품을 찾을 수 없습니다. 다시 시도해주세요.")
                router.push({ name: 'funding_list' });
                clearData();
            }
            else if (verifyResponse.code === 4108) { // "결제 취소 요청 중 오류가 발생했습니다."
                alert("결제 취소 요청 중 오류가 발생했습니다. 다시 시도해주세요.")
                router.push({ name: 'funding_list' });
                clearData();
            }
            else if (verifyResponse.code === 4101) { // "결제 금액이 일치하지 않습니다."
                alert("결제 금액이 일치하지 않습니다. 다시 시도해주세요.")
                router.push({ name: 'funding_list' });
                clearData();
            }
            else if (verifyResponse.code === 4100) { //  "결제 실패"
                alert("결제 실패 하였습니다. 다시 시도해주세요.")
                router.push({ name: 'funding_list' });
                clearData();
            }
        }

    } catch (error) {
        // 통신 에러, 1단계 실패, 혹은 throw된 에러들이 모두 여기로 모입니다.
        console.error("결제 프로세스 에러:", error);
        paymentStatus.value = { status: "FAILED", message: error.message || "결제 시도가 실패하였습니다." };
        alert(paymentStatus.value.message);
    } finally {
        // 성공하든 실패하든 로딩 상태는 해제해줘야 다음 클릭이 가능해요!
        isPaymentProcessing.value = false;
    }
}

// 피니아 데이터 삭제 
const clearData = () => {
    rewardStore.clearRewards()
}

</script>

<template>
    <div class="facet-checkout-wrapper">
        <header class="checkout-header">
            <h1>프로젝트 후원하기</h1>
            <p>서포터님의 소중한 후원은 프로젝트 팀의 성장에 큰 힘이 됩니다.</p>
        </header>

        <div class="checkout-content">
            <div class="input-container">
                <div class="funding-notice-card">
                    <span class="icon">💡</span>
                    <div class="text">
                        <strong>펀딩 결제 안내</strong>
                        <p>본 프로젝트는 안심 결제 시스템을 적용하여, 참여 즉시 결제가 진행됩니다.
                            <br />목표 금액 미달 시 시스템을 통해 수수료를 포함한 결제 금액 전액이 자동 환불됨을 보장합니다.
                        </p>
                    </div>
                </div>

                <section class="form-section">
                    <h2 class="section-title">선택한 리워드</h2>
                    <div class="reward-box">
                        <div v-for="reward in selectedRewards">
                            <div class="reward-main">
                                <h3>{{ reward.title }}</h3>
                                <p class="desc">{{ reward.contents }} </p>
                                <div class="price-qty">
                                    <span class="price">
                                        {{ Number(reward.price * reward.quantity).toLocaleString() }}원</span>
                                    <span class="qty">수량 {{ reward.quantity }}개</span>
                                </div>
                            </div>
                        </div>


                        <div class="extra-support">
                            <label>후원금 더하기 (선택)</label>
                            <p class="sub-text">프로젝트 팀의 지속적인 창작 활동을 위해 추가 후원금을 보낼 수 있습니다.</p>
                            <div class="input-with-unit" :class="{ 'has-error': supportError }">
                                <input type="number" v-model.number="extraSupport" min="0" step="1000"
                                    @blur="validateSupportAmount" @input="supportError = ''" placeholder="0">
                                <span class="unit">원</span>
                            </div>
                            <p v-if="supportError" class="error-msg">{{ supportError }}</p>
                        </div>
                    </div>
                </section>

                <section class="form-section">
                    <h2 class="section-title">배송 정보</h2>
                    <div class="tab-group">
                        <button :class="{ active: shippingMode === 'recent' }" @click="setShippingMode('recent')">최근
                            배송지</button>
                        <button :class="{ active: shippingMode === 'new' }" @click="setShippingMode('new')">새로
                            입력</button>
                    </div>

                    <div class="form-grid">
                        <div class="field">
                            <label>받는 분</label>
                            <input type="text" v-model="shippingInfo.name">
                        </div>
                        <div class="field">
                            <label>휴대폰 번호</label>
                            <input type="tel" v-model="shippingInfo.phone">
                        </div>
                        <div class="field">
                            <label>주소</label>
                            <div class="addr-search">
                                <input type="text" v-model="shippingInfo.postcode" readonly>
                                <button type="button" class="btn-gray">주소찾기</button>
                            </div>
                            <input type="text" v-model="shippingInfo.address" class="mg-t-8" readonly>
                            <input type="text" v-model="shippingInfo.detail" class="mg-t-8" placeholder="상세주소를 입력해 주세요">
                        </div>
                        <div class="field">
                            <label>배송 시 요청사항 (선택)</label>
                            <select v-model="shippingRequest">
                                <option value="">요청사항을 선택해주세요</option>
                                <option value="door">문 앞에 놓아주세요</option>
                                <option value="direct">직접 입력</option>
                            </select>
                        </div>
                    </div>
                </section>

                <section class="form-section">
                    <h2 class="section-title">예약 결제</h2>
                    <div class="tab-group inline">
                        <button :class="{ active: paymentType === 'easy' }"
                            @click="setPaymentType('easy')">간편결제</button>
                        <button :class="{ active: paymentType === 'direct' }"
                            @click="setPaymentType('direct')">직접입력</button>
                    </div>
                </section>

                <section class="form-section">
                    <h2 class="section-title">결제 수단</h2>
                    <div class="method-group">
                        <button :class="{ active: paymentMethod === 'card' }"
                            @click="setPaymentMethod('card')">신용카드</button>
                        <button :class="{ active: paymentMethod === 'kakao' }"
                            @click="setPaymentMethod('kakao')">카카오페이</button>
                        <button :class="{ active: paymentMethod === 'naver' }"
                            @click="setPaymentMethod('naver')">네이버페이</button>
                    </div>
                    <p class="footer-hint">* [안심 결제 보장] 목표 미달 시 시스템이 자동으로 전액 환불을 처리하므로 안심하고 참여하셔도 됩니다.</p>
                </section>
            </div>

            <aside class="summary-sidebar">
                <div class="summary-card">
                    <h3>후원 요약</h3>
                    <div class="price-list">
                        <div class="row"><span>리워드 금액</span><span>{{ Number(finalPrice).toLocaleString() }}원</span>
                        </div>
                        <div class="row"><span>추가 후원금</span><span>{{ Number(extraSupport).toLocaleString() }}원</span>
                        </div>
                        <div class="row"><span>서포터클럽 응원금</span><span>0원</span></div>
                        <div class="row"><span>배송비</span><span>3,000원</span></div>
                        <div class="row discount"><span>할인 금액</span><span>0원</span></div>
                    </div>

                    <div class="total-price-row">
                        <span class="lbl">최종 후원 금액</span>
                        <span class="val">{{ totalAmount.toLocaleString() }}원</span>
                    </div>

                    <div class="agree-box">
                        <label class="custom-check">
                            <input type="checkbox" v-model="isAgreed">
                            <span class="msg">프로젝트 성공 시 결제됨을 확인하였으며, 펀딩 참여에 동의합니다. (필수)</span>
                        </label>
                    </div>

                    <button class="pay-btn" :disabled="!isAgreed || !!supportError" @click="handlePayment">
                        후원하기
                    </button>
                </div>
            </aside>
        </div>
    </div>
</template>

<style scoped>
.facet-checkout-wrapper {
    max-width: 1100px;
    margin: 0 auto;
    padding: 60px 20px;
    color: #333;
}

.checkout-header {
    text-align: center;
    margin-bottom: 60px;
}

.checkout-header h1 {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 12px;
}

.checkout-header p {
    color: #666;
    font-size: 15px;
}

.checkout-content {
    display: flex;
    gap: 80px;
    align-items: flex-start;
}

.input-container {
    flex: 1;
}

.funding-notice-card {
    display: flex;
    gap: 15px;
    padding: 20px;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    margin-bottom: 40px;
}

.funding-notice-card strong {
    font-size: 14px;
    display: block;
    margin-bottom: 4px;
}

.funding-notice-card p {
    font-size: 13px;
    color: #666;
}

.form-section {
    margin-bottom: 50px;
}

.section-title {
    font-size: 18px;
    font-weight: 700;
    border-bottom: 2px solid #1a1a1a;
    padding-bottom: 15px;
    margin-bottom: 25px;
}

.reward-box {
    border: 1px solid #eee;
    padding: 30px;
    border-radius: 8px;
}

.badge {
    background: #f8f8f8;
    color: #A39382;
    padding: 4px 8px;
    font-size: 11px;
    font-weight: 700;
    border-radius: 2px;
}

.reward-main h3 {
    font-size: 18px;
    margin: 15px 0 8px;
}

.desc {
    font-size: 14px;
    color: #888;
    margin-bottom: 20px;
}

.price-qty {
    display: flex;
    justify-content: space-between;
    margin-bottom: 25px;
    padding-bottom: 25px;
    border-bottom: 1px solid #f5f5f5;
}

.price-qty .price {
    font-size: 20px;
    font-weight: 800;
}

.extra-support label {
    display: block;
    font-weight: 700;
    font-size: 14px;
    margin-bottom: 5px;
}

.sub-text {
    font-size: 13px;
    color: #999;
    margin-bottom: 15px;
}

/* 입력창 에러 스타일 */
.input-with-unit {
    position: relative;
    width: 100%;
}

.input-with-unit input {
    width: 100%;
    padding: 12px 40px 12px 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    outline: none;
    transition: border-color 0.2s;
}

.input-with-unit.has-error input {
    border-color: #ff4d4d;
    background-color: #fff9f9;
}

.input-with-unit input::-webkit-outer-spin-button,
.input-with-unit input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.unit {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    font-weight: 700;
    color: #333;
    pointer-events: none;
}

.error-msg {
    color: #ff4d4d;
    font-size: 12px;
    margin-top: 8px;
    font-weight: 500;
}

.tab-group {
    display: flex;
    margin-bottom: 20px;
}

.tab-group button {
    flex: 1;
    padding: 15px;
    border: 1px solid #ddd;
    background: #fff;
    cursor: pointer;
}

.tab-group.inline button {
    max-width: 160px;
}

.tab-group button.active {
    background: #A39382;
    color: #fff;
    border-color: #A39382;
}

.form-grid {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.field label {
    display: block;
    font-weight: 700;
    font-size: 13px;
    margin-bottom: 8px;
}

.field input,
.field select {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.addr-search {
    display: flex;
    gap: 10px;
}

.addr-search input {
    width: 120px;
}

.btn-gray {
    padding: 0 20px;
    border: 1px solid #ddd;
    background: #fff;
    cursor: pointer;
    border-radius: 4px;
}

.mg-t-8 {
    margin-top: 8px;
}

.method-group {
    display: flex;
    gap: 10px;
}

.method-group button {
    flex: 1;
    padding: 15px;
    border: 1px solid #eee;
    background: #fff;
    border-radius: 4px;
    cursor: pointer;
}

.method-group button.active {
    border: 1.5px solid #1a1a1a;
    font-weight: 700;
}

.footer-hint {
    font-size: 12px;
    color: #999;
    margin-top: 15px;
}

.summary-sidebar {
    width: 360px;
    position: sticky;
    top: 40px;
}

.summary-card {
    border: 1px solid #f0f0f0;
    padding: 30px;
    background: #fff;
}

.summary-card h3 {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 25px;
}

.price-list .row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 14px;
    color: #666;
}

.discount span:last-child {
    color: #ff4d4d;
}

.total-price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #f0f0f0;
    padding-top: 25px;
    margin: 25px 0;
}

.total-price-row .lbl {
    font-size: 16px;
    font-weight: 700;
}

.total-price-row .val {
    font-size: 24px;
    font-weight: 800;
    color: #A39382;
}

.agree-box {
    margin-bottom: 25px;
}

.custom-check {
    display: flex;
    gap: 10px;
    cursor: pointer;
}

.custom-check .msg {
    font-size: 12px;
    color: #777;
    line-height: 1.5;
}

.pay-btn {
    width: 100%;
    padding: 18px;
    background: #A39382;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
}

.pay-btn:disabled {
    background: #d2c8bc;
    cursor: not-allowed;
}
</style>