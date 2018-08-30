import React, { PureComponent } from 'react';
import { connect } from 'dva';
import $ from 'jquery';
import { Link } from 'dva/router';
import {Form,Card,Button,Table,Modal,Radio} from 'antd';
import BraftEditor from 'braft-editor';
import 'braft-editor/dist/braft.css';
import styles from './ShowContract.css';
import request from "../../utils/request";

const RadioGroup = Radio.Group;

class showContract extends PureComponent {
  state = {
    userDefined:0,
    is_show:true,
    modelVisible:false
  }
  componentDidMount() {
    $('#MEIQIA-BTN-HOLDER').css('visibility','hidden');
    $('.ant-layout-content').css('margin','0px');
    $('.ant-layout-header').css('display','none');
    $('.ant-layout-footer').css('display','none');
    let TotalData = new FormData();
    TotalData.append('key','diuber2017');
    TotalData.append('secret_key','09e8b1b88e615f0d9650886977af33e9');
    TotalData.append('entity_id',window.location.href.split('entity_id=')[1]);
    request('/api/web/vehicle/getContract',{
      method:'POST',
      body:TotalData,
      credentials:'include',
    }).then((data)=>{
      console.log(data.data.data[2])
      if(data.data.code==1){
        if(data.data.data[1]){
          this.setState({
            contractNo:data.data.data[1].contractNo,
            companyName:data.data.data[1].companyName,
            depositBank:data.data.data[1].depositBank,
            bankAccount:data.data.data[1].bankAccount,
            contractStartTime:data.data.data[1].contractStartTime,
            contractEndTime:data.data.data[1].contractEndTime,
            rentMonthAmount:data.data.data[1].rentMonthAmount,
            capitalMonthAmount:data.data.data[1].capitalMonthAmount,
            deposit:data.data.data[1].deposit,
            capitalDeposit:data.data.data[1].capitalDeposit,
            customerName:data.data.data[1].customerName,
            idNo:data.data.data[1].idNo,
            telephone:data.data.data[1].telephone,
            emergency_contact:data.data.data[1].emergency_contact,
            emergency_contact_telephone:data.data.data[1].emergency_contact_telephone,
            sex:data.data.data[1].sex,
            homeAddress:data.data.data[1].homeAddress,
            licensePlateNo:data.data.data[1].licensePlateNo,
            frameNumber:data.data.data[1].frameNumber,
            engineNumber:data.data.data[1].engineNumber,
            vehicleTemplate:data.data.data[1].vehicleTemplate,
          })
        }else{
          this.setState({
            userDefined:1,
            pdfhtml:data.data.data[2]
          })
          $('#MEIQIA-BTN-HOLDER').css("cssText", "display:none !important;");
          // this.setState({
          //   userDefined:1,
          //   src:"https://gc.diuber.com/web/login/contract?key=diuber2017&secret_key=09e8b1b88e615f0d9650886977af33e9&company_id="+window.localStorage.getItem("companyId")+'&entity_id='+window.location.href.split('entity_id=')[1]
          // })
        }
      }
    }).catch(()=>{})
  }
  //打印合同
  PrintContract = ()=>{
    $('#DownloadButton').css('display','none')
    window.print(); // 开始打印
  }
  //编辑页面
  EditorHtml = ()=>{
    this.setState({is_show:false})
  }
  BackHtml=()=>{
    this.setState({is_show:true})
  }
  SubmitHtmlChange = (content) => {
    console.log('保存')
    this.setState({
      pdfhtml:content,
    })
  }
  AddHtml =()=>{
    // const content = "111";
    // this.editorInstance.insertText(content);
    this.setState({modelVisible:true})
  }

  //弹窗
  ModelOk = ()=>{
    this.setState({modelVisible:false})
  }
  ModelCancel = ()=>{
    this.setState({modelVisible:false})
  }
  ChangeItem = (e) => {
    this.setState({
      value: e.target.value,
    });
  }
  render() {
    const columns = [
      {key: '车辆使用人姓名', title: '车辆使用人姓名', dataIndex: 'name',},
      {key: '身份证号码', title: '身份证号码', dataIndex: 'IDnum',},
      {key: '电话', title: '电话', dataIndex: 'telephone',},
      {key: '性别', title: '性别', dataIndex: 'sex',},
      {key: '现住地址', title: '现住地址', dataIndex: 'address',},
    ];
    const data = [
      {
        key: '1',
        name: this.state.customerName,
        IDnum: this.state.idNo,
        telephone: this.state.telephone,
        sex: this.state.sex,
        address: this.state.homeAddress,
      }
    ];
    const uploadProps = {
      action: "http://v0.api.upyun.com/devopee",
      onChange: this.onChange,
      listType: 'picture',
      fileList: this.state.responseList,
      data: (file) => {

      },
      multiple: true,
      beforeUpload: this.beforeUpload,
      showUploadList: true
    };
    const editorProps = {
      height: '100%',
      contentFormat: 'html',
      initialContent: this.state.pdfhtml,
      onChange: this.SubmitHtmlChange,
    }
    return (
      <div id="ContractContent">
        {
          this.state.is_show ?
            <div>
              <div style={{position:'fixed',right:'4%',top:'54px',zIndex:'10'}} id="DownloadButton">
                <Button onClick={this.PrintContract} type="primary">打印</Button>
                <Button onClick={this.EditorHtml} type="primary" style={{marginLeft:24}}>编辑</Button>
              </div>
              {
                this.state.userDefined==0  &&  <Card>
                  <p className={styles.ContractId}>合同编号：{this.state.contractNo}</p>
                  <div style={{textAlign:'center',display:'flex',flexFlow:'row'}}><strong style={{flex:'1'}}><p className={styles.ContractTitle}>车辆租赁合同</p></strong></div>
                  <div className={styles.ContractDiv}>
                    <p className={styles.ContractTitleSimple}><strong>承租方（甲方）：</strong></p>
                    <p className={styles.ContractTitleSimple}><strong>出租方（乙方）：{this.state.companyName}</strong></p>
                    <p>依据中华人民共和国有关法律法规，本着诚实信用、平等互利的原则，甲乙双方经友好协商，就乙方向甲方提供租赁车业务事项达成一致意见，签订本合同。</p>
                    <p className={styles.ContractTitleSimple}><strong>一、租赁车辆</strong></p>
                    <ul>
                      <li><p> 1.	乙方将
                        {this.state.licensePlateNo? <strong> {this.state.licensePlateNo} {this.state.vehicleTemplate}</strong>:<span> ______________ </span>}台车辆出租给甲方自驾使用，双方约定租	期为
                        {this.state.contractStartTime? <strong> {this.state.contractStartTime} </strong>:<span> __________ </span>}
                        至
                        {this.state.contractEndTime? <strong> {this.state.contractEndTime} </strong>:<span> __________ </span>}。车辆明细见《附件一：车辆租期价格服务清单》。</p></li>
                      <li><p> 2.	所租车辆状态及详情以双方确认《车辆交接清单》为准。</p></li>
                      <li><p> 3.	每辆每年行驶里程不得超过{this.state.maxKm? <strong> {this.state.maxKm} </strong>:<span> _____ </span>}万公里，超过公里数按 {this.state.maxPay? <strong> {this.state.maxPay} </strong>:<span> _____ </span>}元/公里收取超里程费。</p></li>
                      <li><p> 4.	甲方信息：营业执照 法人姓名 法人身份证件号</p></li>
                      <li><p> 5.	组织机构代码证 税务登记证</p></li>
                      <li><p> 6.	甲方车辆管理责任人信息：</p></li>
                      <li><p> <Table scroll={{x: 600}} pagination={false} style={{width:'100%'}} columns={columns} dataSource={data} bordered/></p></li>
                      <li><p>在租赁期间，甲方变更负责人信息，应在自变更之日起3天内书面通知乙方</p></li>
                      <li><p> 7.	本合同有效期限为合同签署之日起至合同规定的车辆归还手续结束之日止。</p></li>
                    </ul>
                    <p className={styles.ContractTitleSimple}><strong>二、租金及支付</strong></p>
                    <ul>
                      <li><p> 1. 租金为每辆{this.state.rentMonthAmount? <strong> {this.state.rentMonthAmount} </strong>:<span> _____ </span>}，总计租金 _____ 元（大写： ______________________ 元整）。</p></li>
                      <li><p> 2. 甲方应在租期开始前 3 日内一次性交付租赁押金：{this.state.deposit? <strong> {this.state.deposit} </strong>:<span> _____ </span>} 元，以及首次租金 {this.state.rentMonthAmount? <strong> {this.state.rentMonthAmount} </strong>:<span> _____ </span>}（大写：{this.state.capitalMonthAmount? <strong> {this.state.capitalMonthAmount} </strong>:<span> _____ </span>}）。乙方采取预收款方式，每 1 个月为一个付款周期，每个周期结束前 3 个工作日内甲方应支付给乙方下一周期租金。逾期支付租金，按逾期日数每日加收月租费5%的滞纳金。</p></li>
                      <li><p> 3.	该租赁押金不能用于抵扣承租方应付的租车费及其他应付费用。租期内，甲方若违反本合同有关条款，乙方有权从租赁押金中抵扣甲方应支付给乙方的款项，经乙方通知，甲方应在10个工作日内补齐足额租赁押金，逾期按拖欠租金标准计算滞纳金。租赁结束，甲方同意将租赁押金转为不计息的违章押金。</p></li>
                      <li><p> 4. 合同终止时，甲方应按双方约定的还车时间及时交还租用车辆，每逾期一日，除继续计收租金外，需另外支付租金5%的滞纳金。</p></li>
                      <li><p> 5.	租金、租赁押金以银行转账方式支付。乙方应开立收据。</p></li>
                      <li><p> 6.	其他费用详见《补充协议一》。</p></li>
                      <li><p> 7.	收款单位：嘀友管车测试公司</p></li>
                      <li><p> 开户银行：<strong style={{marginLeft:'30px'}}>{this.state.depositBank}</strong></p></li>
                      <li><p> 银行账号：<strong style={{marginLeft:'30px'}}>{this.state.bankAccount}</strong></p></li>
                    </ul>
                    <p className={styles.ContractTitleSimple}><strong>三、甲方基本权利和义务</strong></p>
                    <ul>
                      <li><p> 1.	甲方所提供的证件、信息及资料须真实有效，如因甲方提供不实或者超过有效期的资料以及未及时提供信息变更而造成乙方的经济损失及法律责任均由甲方负责。在租赁期间，甲方变更相关信息，应在自变更之日起3天内书面通知乙方。</p></li>
                      <li><p> 2.	甲方应自行承担租期内租赁车辆的包括但不限于电费、燃油费、过路、过桥、停车等费用。</p></li>
                      <li><p> 3.	甲方如为公司的，车辆仅限于由甲方认可的具备合法驾驶资质的人员驾驶，且甲方承诺其驾驶人员已具备一年以上的实际驾驶经验，同时该驾驶人员的行为视同甲方行为。甲方如为个人的，车辆仅限于甲方本人驾驶使用，且甲方承诺至本协议签署之日其已具备一年以上的实际驾驶经验。在租赁期内，发生与车辆有关的事故，包括但不限于交通违章、交通肇事、车辆盗抢等，超出保险赔付范围的，由甲方承担一切责任和后果，并赔偿乙方损失。</p></li>
                      <li><p> 4.	甲方应认真了解，检查、掌握承租车辆的各种性能和操作方法，点清车辆附件，甲方清点验收后应在车辆交接清单上签字确认，甲方签署车辆交接清单即视作乙方按照合同约定将租赁车辆交付甲方使用。（车况即以《车辆交接清单》为准）。</p></li>
                      <li><p> 5.	车辆租赁期满后,甲方应在乙方的营业时间内按本合同规定的还车时间和指定地点将车辆及其装备（若有）和各种证件交还出租方。还车时车辆的轮胎、工具、随车证件、附件和设施处于发车时同样的状态（正常的车辆磨损除外,但不包括车辆过度使用造成的磨损）,车况的确认以本合同附件《车辆交接单》为准,如有新的碰撞,擦痕等损坏现象或设备、证件不全,甲方应按实际损失支付维修或重置和其他相应的费用。</p></li>
                      <li><p> 6.	甲方应遵守各项法律法规，不得将租赁车辆转卖、抵押、质押、转借、典当、转租租赁车辆及从事营利性营运，不得利用车辆从事不符合其功能的运输，否则应负担由此引起的全部行政责任、刑事责任；并且乙方有权单方面终止合同，收回车辆，没收押金。如给乙方造成损失的，应承担赔偿责任。</p></li>
                      <li><p> 7.	甲方承诺在租赁期间，其应于每月底将租用车辆运行公里报于乙方，以确保车辆按整车厂商的保养要求进行保养，乙方据此安排车辆进行保养或检测。甲方应配合乙方工作，事先将车辆充满电，按照约定时间送保或检测。因甲方怠于履行前述义务造成乙方车辆脱保引起的损失（包括但不限于乙方因此遭受第三方索赔、维修费、检测费、鉴定费等）均由甲方负责赔偿。</p></li>
                      <li><p> 8.	甲方使用不当造成的车辆和机件损坏（包括但不限于认为操作造成机油烧干，电池损坏，水箱漏水，发动机进水，轮胎及车身人为刻意损坏等类似情况），产生的维修费用甲方负担。</p></li>
                      <li><p> 9.	车辆的轮胎、雨刮及灯泡属于易损件，使用中造成的损耗由甲方自行负责，如需更换则必须到甲方指定的修理点进行维修更换，如甲方擅自使用不符合国家标准的配件，造成的损失由甲方负责，乙方保留追究其法律责任的权利。</p></li>
                      <li><p> 10.	甲方不得擅自修理租赁车辆或改动租赁车辆的任何部件、零件、内饰、外观，严禁拆动车辆里程表。如因特殊情况，确须紧急修理车辆的，甲方在征得乙方书面同意后，可至乙方指定维修店进行维修。如发现甲方擅自修理而造成租赁车辆质量不符合车辆技术检测部门要求及/或致租赁车辆乙方与第三方约定的，甲方应承担乙方因此造成的全部经济损失（包括但不限于乙方因此遭受第三方索赔、鉴定费、修理费、诉讼费、律师费等）。如因车辆自身原因造成无法继续行驶的，甲方凭乙方指定维修网点的维修凭证可减免维修期间的租金或向乙方要求提供替换车辆。</p></li>
                      <li><p> 11.当租赁车发生交通事故时，甲方应立即通知乙方，并应采取合理措施，防止损失的进一步扩大。待事故车辆维修完毕后，乙方将通知甲方至指定地点提取修理后的汽车。</p></li>
                      <li><p> 12.租赁期届满前三十个工作日甲方若需续租的应以书面方式通知乙方，双方另行签订租赁合同。</p></li>
                      <li><p> 13. 甲方应按照整车厂随车提供的用户手册的要求对车辆进行充电。充电时需要使用符合要求的充电设备。甲方应确保即使在车辆闲置期间也能够得到定期的充电，因闲置时间过长导致高压蓄电池电量过低而损坏的，甲方需要自行承担修理费用。因闲置过长时间无法启动车辆，甲方可向乙方请求派员进行维护，乙方第一次提供维护服务为免费，此后再次派员进行维护乙方须偿付每次300元的费用。</p></li>
                      <li><p> 14. 如甲方承租车辆为纯电动力性质，甲方确认知晓车辆对充电设施及服务的依赖性以及行驶范围的有限性，并应确保承租车辆以合理的方式在适当的地域范围内行驶。</p></li>
                      <li><p> 15.甲方使用车辆时因停放、保管不妥，造成牌照等证件丢失的，在租赁期内，甲方除承担补办牌照等证件的全部费用外，仍应支付租金；租赁已到期的，甲方还应承担租赁期满至补办牌照手续结束期间的租金。在补办期间，乙方不提供免费代替车辆。</p></li>
                      <li><p> 16.在下述任何一种情况发生时，视为甲方根本违约，除承担相应的违约责任以外，乙方有权随时随地收回所租车辆并有权单方面解除合同，已收取的款项包括租赁押金不予退还，并追偿甲方应付的费用以及给出出租方所造成的全部损失。</p>
                        <ul><li><p> 1)	未经乙方书面许可连续拖欠应付租金7个工作日以上的；</p></li><li><p> 2)	因甲方原因导致车辆或其证照被第三方扣押一个月及以上的；</p></li><li><p> 3)	甲方违反本合同项下的任何其它陈述、保证或承诺，或甲方未履行本合同约定的其它义务的；</p></li><li><p> 4)	本合同约定或法律、法规规定的其它情形。</p></li></ul></li>
                      <li><p> 17. 甲方明确其已完全知道、了解承租车辆及其充电设备的使用方法，甲方承诺始终保持承租车辆电池盒封装完好、任何时候均不得私自拆封，并远离危险源。</p></li>
                      <li><p> 18.租赁期间，甲方不得自行或允许他人有下列行为：</p>
                        <ul><li><p> 1）在依据用户手册不适宜或不安全条件下使用承租车辆；</p></li><li><p> 2）拖运拖车、车辆或其他物体；</p></li><li><p> 3）使用承租车辆运送易燃、易爆、有毒或其它危险物品；</p></li><li><p>  4）自行手动检测、修理承租车辆；</p></li><li><p>  5）触碰承租车辆的电缆及/或连接器；</p></li><li><p>  6）对承租车辆的充电系统及/或充电桩进行任何形式的改装、拆除、更换零件等；</p></li><li><p>  7）为承租车辆添加任何附件（包括但不限于车窗贴膜等）；</p></li><li><p>  8）自行对承租车辆底盘进行清洗；</p></li><li><p>  9）其它违反用户手册及/或可能对承租车辆及/或甲方（使用人）本身造成伤害的行为。</p></li></ul></li>
                      <li><p>19. 甲方为公司的，须指定以下负责人签署《车辆交接清单》、《替换车辆交接清单》，确定交接车辆状态及详情，并提供负责人身份证复印件。在租赁期间，甲方变更负责人信息，应在自变更之日起3天内书面通知乙方。</p></li>
                    </ul>
                    <p className={styles.ContractTitleSimple}><strong>四、	乙方的基本权利和义务</strong></p>
                    <ul>
                      <li><p>1.	乙方拥有租赁车辆的所有权，不应在租赁期内出卖该租赁车辆或在该车辆上为第三方提供担保。</p></li>
                      <li><p>2.	乙方有义务为甲方提供设备齐全、车况良好的车辆以及有效的年检证、行驶证等有效证件，若车辆到达保养公里或车辆证件到期前，通知甲方参加例行保养或更换有效证件。</p></li>
                      <li><p>3.	乙方提供的车辆有严重的质量问题造成甲方无法正常使用的，甲方有权要求乙方更换车辆。甲方原因导致汽车故障或无法正常行驶（非车辆自身故障），乙方不提供替换车辆。其他原因，需由乙方为甲方提供替换车辆的，甲方应签署《替换车辆交接清单》，确定交接车辆状态及详情。替换车辆的相关责任义务按照本合同租赁车的约定执行。</p></li>
                      <li><p>4.	乙方负责对租出的车辆进行正常的修理、定期保养、车辆年检、缴纳车船税（若有）。</p></li>
                    </ul>
                    <p className={styles.ContractTitleSimple}><strong>五、	交通事故和保险索赔</strong></p>
                    <ul>
                      <li><p>1.	乙方需按照法律规定履行缴纳车船税、车辆附加费的义务。同时，乙方已为出租车辆投保了交强险、车辆损失险、第三者责任险、盗抢险，投保额参见《保险费及其他费用明细》，甲方要求增保其他险种或提高保险金额的，乙方代为办理，甲方承担相关费用（见《保险费及其他费用明细》）。</p></li>
                      <li><p>2.	发生包括但不限于交通意外事故及人员伤亡和车损等情况后，根据法定主管部门的事故认定意见，在保险公司索赔范围以外的责任与赔偿由甲方自行承担。</p></li>
                      <li><p>3.	如发生事故的，甲方应协助乙方向保险公司进行理赔，甲方应如实提供交通管理部门、保险公司出具的事故证明、责任裁定书、事故调解书、判决书等文件。</p></li>
                      <li><p>4.	因甲方使用租赁车辆导致的违章及罚款，由乙方定期查询车辆违章信息并以书面形式传达给甲方，甲方自行处理，如逾期不处理造成的损失则由甲方承担。</p></li>
                      <li><p>5.	如果车辆出事故，须出险且甲方为全责（含主责，次责），乙方收取事故理赔1500元/次的保险上浮费用。维修费用总金额超过2000元的，则甲方应按超出2000元部分的金额的25%作向乙方支付的车辆加速折旧损失费【车辆加速折旧损失费＝（实际维修费用－2000）*25%】。</p></li>
                      <li><p>6.	如车辆定损总额等于或超过1万元的（含车辆报废在内），除上述约定外，甲方应另外按定损总额的25%向乙方赔偿车辆贬值损失。</p></li>
                      <li><p>7.	甲方发生交通违章的，除应及时完成违章处理、缴清罚款外还应承担由此造成交强险上浮费用200元/次，前述上浮费用保险年度内最高收取1000元。保险年度内，若甲方发生交通事故3次以上的（含3次），甲方应承担由此造成的保险费上浮费用1000元。</p></li>
                      <li><p>8.	上述第5条、第6条费用在合同终止时，甲方须立即支付给乙方。如甲方未及时支付，乙方有权直接从租赁押金中直接扣除。</p></li>
                    </ul>
                    <p className={styles.ContractTitleSimple}><strong>六、	合同终止及违约责任</strong></p>
                    <ul>
                      <li><p>1.	若甲方构成违约时，则乙方可以书面通知甲方单方面终止合同，且扣除车辆押金作为甲方违约金。</p></li>
                      <li><p>2.	若乙方构成违约时，则甲方可以书面通知乙方单方面终止合同，且乙方需对甲方实际产生的经济损失进行赔偿。</p></li>
                      <li><p>3.	除合同另有约定外，乙方于甲方结束租赁关系之日起，在甲方付清所有应付费用后的次月15号将押金退还给甲方。</p></li>
                    </ul>
                    <p className={styles.ContractTitleSimple}><strong>七、	争议的解决</strong></p>
                    <ul>
                      <li><p>1.	政府政策重大变化，不可抗力以及无法追究责任造成的损失，依照有关法律法规和公平原则双方协调解决。其中，涉及因车辆质量问题由整车厂或者国家质检总局要求召回的情况，乙方免责。</p></li>
                      <li><p>2.	本合同适用中华人民共和国法律，有关本合同的一切争议，双方应友好协商解决，若协商不成，双方同意将该争议提交乙方所在地有管辖权的人民法院诉讼解决。</p></li>
                    </ul>
                    <p className={styles.ContractTitleSimple}><strong>八、	其他</strong></p>
                    <ul>
                      <li><p>本合同提及的《补充协议》、《用户手册》、《车辆交接清单》、《替换车辆交接清单》、《其他收费明细表》，都是本合同的组成部分,与本合同同等法律效力，本合同的任何修改必须通过双方同意的书面形式进行。签订本合同时，甲方已了解上述材料。</p></li>
                    </ul>
                    <p className={styles.ContractTitleSimple}><strong>九、	合同生效</strong></p>
                    <ul>
                      <li><p>本合同双方签字盖章后立即生效；合同一式二份，双方各执一份，具有同等法律效力。</p></li>
                    </ul>
                    <p className={styles.ContractTitleSimple}><strong>十、 双方约定其他内容</strong></p>
                    <div className={styles.ContractBottom}>
                      <div style={{flex:'1'}}>
                        <p>甲方（盖章）</p>
                        <p>授权代表(签字)：        </p>
                        <p>签订日期:<span style={{letterSpacing:'20px'}}>       年     月     日</span></p>
                      </div>
                      <div style={{flex:'1'}}>
                        <p>乙方（盖章）</p>
                        <p>授权代表(签字)：        </p>
                        <p>签订日期:<span style={{letterSpacing:'20px'}}>      年     月     日</span></p>
                      </div>
                    </div>
                  </div>
                </Card>
              }
              {
                this.state.userDefined!=0  &&
                <p dangerouslySetInnerHTML={{ __html: this.state.pdfhtml}}></p>
              }
            </div>:
            <div style={{background:'#Fff'}}>
              <div style={{position:'fixed',right:'4%',top:'54px',zIndex:'10'}} id="DownloadButton">
                <Button onClick={this.BackHtml} type="primary">返回</Button>
                <Button onClick={this.SubmitHtmlChange} type="primary" style={{marginLeft:24}}>保存</Button>
                {/*<Button onClick={this.AddHtml} type="primary" style={{marginLeft:24}}>插入信息</Button>*/}
              </div>
              <Modal
                title="选择信息"
                visible={this.state.modelVisible}
                onOk={this.ModelOk}
                onCancel={this.ModelCancel}
              >
                <RadioGroup onChange={this.ChangeItem} value={this.state.value}>
                  <Radio value={1}>A</Radio>
                  <Radio value={2}>B</Radio>
                  <Radio value={3}>C</Radio>
                  <Radio value={4}>D</Radio>
                </RadioGroup>
              </Modal>
              <BraftEditor {...editorProps}  ref={instance => this.editorInstance = instance}/>
            </div>
        }
      </div>
    );
  }
}
const ShowContract = Form.create()(showContract);

export default ShowContract;
