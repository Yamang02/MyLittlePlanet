class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });

    // 게임 상태
    this.gameState = {
      playerHealth: 3,
      kingHealth: 100,
      currentPhase: 1,
      combo: 0,
      lastAttackTime: 0,
      gameStartTime: 0,
      isGameOver: false
    };

    // 페이즈별 공격 패턴
    this.attackPatterns = {
      1: [
        { text: "앉아라!", direction: "down", speed: 200 },
        { text: "일어나라!", direction: "up", speed: 200 },
        { text: "이리오너라!", direction: "center", speed: 200 }
      ],
      2: [
        { text: "엎드려라!", direction: "down", speed: 300, count: 3 },
        { text: "네가 감히!", direction: "multi", speed: 300, count: 4 },
        { text: "명령이다!", direction: "random", speed: 300, count: 5 }
      ],
      3: [
        { text: "가까이...오거라", direction: "weak", speed: 150 },
        { text: "부탁하마...", direction: "plea", speed: 100 },
        { text: "떠나지..말거라", direction: "weak", speed: 120 }
      ]
    };
  }

  create() {
    console.log('왕의 행성 게임 시작');

    // 씬 이벤트 리스너 등록 (create에서 해야 함)
    this.events.on('shutdown', this.shutdown, this);
    this.events.on('destroy', this.shutdown, this);

    // 게임 상태 초기화
    this.resetGameState();

    // 배경 생성
    this.createBackground();

    // 캐릭터 생성
    this.createCharacters();

    // UI 생성
    this.createUI();

    // 입력 설정
    this.setupInput();

    // 물리 설정
    this.setupPhysics();

    // 말풍선 그룹 분리 - 기본 설정 확인
    console.log('물리 그룹 생성 시작...');

    this.kingAttacks = this.physics.add.group({
      allowGravity: false,   // 중력 비활성화
      immovable: false       // 이동 가능
    });

    this.playerAttacks = this.physics.add.group({
      allowGravity: false,
      immovable: false
    });

    console.log('물리 그룹 생성 완료');

    // 오프닝 대사 표시
    this.showOpening();
  }

  createBackground() {
    const { width, height } = this.cameras.main;

    // 우주 배경 (왕의 행성)
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x2c3e50, 0x34495e, 0x8e44ad, 0x9b59b6);
    bg.fillRect(0, 0, width, height);

    // 별들
    for (let i = 0; i < 50; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height * 0.6),
        Phaser.Math.Between(1, 3),
        0xffffff,
        Phaser.Math.FloatBetween(0.3, 1)
      );
    }

    // 왕좌 (스테이지 우측) - 바닥 기준으로 위치 조정
    const throneX = width * 0.8;
    this.floorY = height * 0.7; // 캐릭터들이 화면 하단쪽에 적절히 위치하도록 조정
    const throneY = this.floorY - 25; // 왕좌 받침의 아래쪽이 바닥이 되도록

    // 왕좌 받침 (바닥 기준)
    this.add.rectangle(throneX, throneY + 20, 100, 40, 0x8e44ad)
      .setStrokeStyle(3, 0x9b59b6);

    // 왕좌 등받이
    this.add.rectangle(throneX, throneY - 30, 80, 100, 0x8e44ad)
      .setStrokeStyle(3, 0x9b59b6);
  }

  createCharacters() {
    const { width } = this.cameras.main;

    // 어린왕자 (스테이지 좌측에서 시작) - 바닥에 발이 닿도록 위치 조정
    this.player = this.physics.add.sprite(width * 0.2, this.floorY - 30, null);
    this.player.setDisplaySize(40, 60);
    this.player.setTint(0x3498db); // 파란색
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    this.player.setGravityY(1000); // 중력 증가로 더 빠른 착지

    // 플레이어 상태
    this.playerState = {
      isJumping: false,
      isDodging: false,
      isParrying: false,
      lastDodgeTime: 0,
      lastParryTime: 0,
      canJump: true
    };

    // 왕 (왕좌 근처) - 바닥에 발이 닿도록 위치 조정
    this.king = this.physics.add.sprite(width * 0.8, this.floorY - 35, null);
    this.king.setDisplaySize(50, 70);
    this.king.setTint(0xe74c3c); // 빨간색
    this.king.setCollideWorldBounds(true);
    this.king.setGravityY(800);

    // 바닥과 충돌 설정 - 바닥 위치를 정확히 맞춤
    const floor = this.physics.add.staticGroup();
    const floorBody = floor.create(width / 2, this.floorY + 15, null);
    floorBody.setSize(width, 30);
    floorBody.setVisible(false);

    this.physics.add.collider(this.player, floor, () => {
      this.playerState.canJump = true;
      this.playerState.isJumping = false;
    });
    this.physics.add.collider(this.king, floor);

    // 바닥 참조 저장
    this.floor = floor;
  }

  createUI() {
    const { width, height } = this.cameras.main;

    // 왕 체력바 (화면 상단 전체 너비)
    this.kingHealthBg = this.add.rectangle(width / 2, 30, width - 40, 25, 0x2c3e50);
    this.kingHealthBg.setStrokeStyle(3, 0x95a5a6);

    this.kingHealthBar = this.add.rectangle(20, 30, width - 40, 19, 0xe74c3c);
    this.kingHealthBar.setOrigin(0, 0.5);

    // 왕 라벨
    this.add.text(width / 2, 10, '왕의 권위', {
      fontSize: '16px',
      fill: '#ecf0f1',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 어린왕자 체력 (캐릭터 위에 하트 표시)
    this.playerHearts = [];
    for (let i = 0; i < 3; i++) {
      const heart = this.add.text(0, 0, '♥', {
        fontSize: '20px',
        fill: '#e74c3c'
      });
      this.playerHearts.push(heart);
    }

    // 콤보 카운터 (하단 좌측)
    this.comboText = this.add.text(20, height - 80, 'COMBO: 0', {
      fontSize: '24px',
      fill: '#f1c40f',
      fontFamily: 'Arial'
    });

    // 조작법 안내 (하단 중앙)
    this.controlsText = this.add.text(width / 2, height - 30,
      '← → : 이동   SPACE : 점프   X : 회피   Z : 패링', {
      fontSize: '16px',
      fill: '#bdc3c7',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 3초 후 조작법 안내 사라짐
    this.time.delayedCall(3000, () => {
      if (this.controlsText) {
        this.controlsText.setVisible(false);
      }
    });
  }

  setupInput() {
    this.keys = {
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      x: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X),
      z: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
    };
  }

  setupPhysics() {
    console.log('=== 물리 시스템 설정 ===');

    // 왕의 공격과 플레이어 충돌 감지
    console.log('왕의 공격 vs 플레이어 충돌 감지 설정');
    this.physics.add.overlap(this.player, this.kingAttacks, (player, bubble) => {
      console.log('플레이어와 말풍선 충돌 감지!');
      this.hitPlayer(player, bubble);
    }, null, this);

    // 플레이어 패링 공격과 왕 충돌 감지
    console.log('플레이어 공격 vs 왕 충돌 감지 설정');
    this.physics.add.overlap(this.king, this.playerAttacks, (king, bubble) => {
      console.log('왕과 패링 공격 충돌 감지!');
      this.hitKing(king, bubble);
    }, null, this);

    console.log('물리 시스템 설정 완료');

    // 충돌 감지 수동 체크 시스템 추가
    this.manualCollisionCheck = true;
  }

  showOpening() {
    const { width, height } = this.cameras.main;

    // 왕의 오프닝 대사
    const openingText = this.add.text(width / 2, height / 2,
      '"나는 이 행성의 왕이다!"', {
      fontSize: '32px',
      fill: '#e74c3c',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      openingText.setText('"무릎을 꿇어라!"');

      this.time.delayedCall(2000, () => {
        openingText.destroy();
        this.startGame();
      });
    });
  }

  startGame() {
    // 첫 번째 공격 시작
    this.scheduleNextAttack();
  }

  update(time, delta) {
    if (this.gameState.isGameOver) return;

    // 플레이어 입력 처리
    this.handlePlayerInput(time);

    // 페이즈 체크
    this.checkPhaseTransition();

    // UI 업데이트
    this.updateUI();

    // 말풍선 업데이트
    this.updateSpeechBubbles();

    // 말풍선 상태 디버깅 - 더 자세히 (게임 오버가 아닐 때만)
    if (time % 1000 < 50 && this.kingAttacks && this.playerAttacks) { // 1초마다 상태 체크
      console.log(`=== 말풍선 상태 체크 ===`);
      console.log(`현재 왕의 공격 수: ${this.kingAttacks.children ? this.kingAttacks.children.size : 0}`);
      console.log(`현재 플레이어 공격 수: ${this.playerAttacks.children ? this.playerAttacks.children.size : 0}`);

      if (this.kingAttacks.children && this.kingAttacks.children.entries) {
        this.kingAttacks.children.entries.forEach((bubble, index) => {
          if (bubble.active && bubble.body) {
            console.log(`왕 공격 ${index}:`);
            console.log(`  - 위치: (${bubble.x.toFixed(1)}, ${bubble.y.toFixed(1)})`);
            console.log(`  - 속도: (${bubble.body.velocity.x.toFixed(1)}, ${bubble.body.velocity.y.toFixed(1)})`);
            console.log(`  - 가속도: (${bubble.body.acceleration.x.toFixed(1)}, ${bubble.body.acceleration.y.toFixed(1)})`);
            console.log(`  - 중력: ${bubble.body.gravity.y}`);
            console.log(`  - 이동 가능: ${bubble.body.moves}`);
          }
        });
      }
    }

    // 충돌 감지 수동 체크
    if (this.manualCollisionCheck) {
      this.checkManualCollisions();
    }

    // 게임 종료 체크
    this.checkGameEnd();
  }

  handlePlayerInput(time) {
    const player = this.player;
    const keys = this.keys;

    // 좌우 이동
    if (keys.left.isDown) {
      player.setVelocityX(-200);
    } else if (keys.right.isDown) {
      player.setVelocityX(200);
    } else {
      player.setVelocityX(0);
    }

    // 점프 (스페이스바) - 점프 높이와 체공시간 조정
    if (Phaser.Input.Keyboard.JustDown(keys.space) && this.playerState.canJump && !this.playerState.isJumping) {
      player.setVelocityY(-350); // 점프력 감소로 체공시간 단축
      this.playerState.isJumping = true;
      this.playerState.canJump = false;
      console.log('점프!');
    }

    // 회피 (X키 - 쿨다운 1초)
    if (Phaser.Input.Keyboard.JustDown(keys.x) &&
      time - this.playerState.lastDodgeTime > 1000) {
      this.performDodge(time);
    }

    // 패링 (Z키)
    if (Phaser.Input.Keyboard.JustDown(keys.z)) {
      this.performParry(time);
    }

    // 패링 상태 해제
    if (time - this.playerState.lastParryTime > 200) {
      this.playerState.isParrying = false;
    }
  }

  performDodge(time) {
    this.playerState.isDodging = true;
    this.playerState.lastDodgeTime = time;

    // 무적 시간 300ms
    this.player.setTint(0xffffff);

    // 입력 방향 기반 회피 이동 개선
    let direction = 0;

    if (this.keys.left.isDown) {
      direction = -1;
    } else if (this.keys.right.isDown) {
      direction = 1;
    } else {
      // 방향키가 눌리지 않았으면 가장 가까운 말풍선 반대 방향으로
      const nearestBubble = this.findNearestKingAttack();
      if (nearestBubble) {
        direction = nearestBubble.x < this.player.x ? 1 : -1;
      } else {
        // 말풍선이 없으면 화면 중앙 반대 방향으로
        direction = this.player.x < this.cameras.main.width / 2 ? 1 : -1;
      }
    }

    // 빠른 회피 이동
    this.player.setVelocityX(direction * 500);

    // 회피 이펙트
    const dodgeEffect = this.add.circle(this.player.x, this.player.y, 20, 0xffffff, 0.6);
    this.tweens.add({
      targets: dodgeEffect,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => dodgeEffect.destroy()
    });

    this.time.delayedCall(300, () => {
      this.playerState.isDodging = false;
      this.player.setTint(0x3498db);
    });

    console.log(`회피! 방향: ${direction > 0 ? '우' : '좌'}`);
  }

  performParry(time) {
    this.playerState.isParrying = true;
    this.playerState.lastParryTime = time;

    // 패링 시각 효과
    this.player.setTint(0xf1c40f);

    this.time.delayedCall(200, () => {
      if (!this.playerState.isParrying) return;
      this.player.setTint(0x3498db);
    });
  }

  scheduleNextAttack() {
    if (this.gameState.isGameOver) return;

    const phase = this.gameState.currentPhase;
    let delay;

    // 페이즈별 공격 간격
    switch (phase) {
      case 1:
        delay = Phaser.Math.Between(2000, 3000);
        break;
      case 2:
        delay = Phaser.Math.Between(1000, 1500);
        break;
      case 3:
        delay = Phaser.Math.Between(3000, 4000);
        break;
    }

    // 공격 타이머 저장하여 나중에 정리할 수 있도록
    this.attackTimer = this.time.delayedCall(delay, () => {
      if (!this.gameState.isGameOver) {
        this.kingAttack();
        this.scheduleNextAttack();
      }
    });
  }

  kingAttack() {
    const phase = this.gameState.currentPhase;
    const patterns = this.attackPatterns[phase];
    const pattern = Phaser.Utils.Array.GetRandom(patterns);

    this.createSpeechBubble(pattern);
  }

  createSpeechBubble(pattern) {
    const kingPos = { x: this.king.x, y: this.king.y };
    const initialPlayerPos = { x: this.player.x, y: this.player.y };

    console.log(`=== 말풍선 생성 시작 ===`);
    console.log(`왕 위치: (${kingPos.x}, ${kingPos.y})`);
    console.log(`플레이어 위치: (${initialPlayerPos.x}, ${initialPlayerPos.y})`);
    console.log(`패턴: ${pattern.text}, 속도: ${pattern.speed}`);

    const count = pattern.count || 1;
    console.log(`말풍선 개수: ${count}`);
    
    // 그룹화된 말풍선들에게 공통 궤적 타입 선택
    const groupTrajectoryType = this.selectTrajectoryType(pattern, this.gameState.currentPhase, 0);
    console.log(`그룹 궤적 타입: ${groupTrajectoryType}`);

    for (let i = 0; i < count; i++) {
      this.time.delayedCall(i * 200, () => {
        console.log(`말풍선 ${i + 1} 생성 시작...`);

        // 말풍선 생성 - 기본 사각형으로 시작
        const startX = kingPos.x;
        const startY = kingPos.y - 50;

        console.log(`말풍선 시작 위치: (${startX}, ${startY})`);

        // 물리 스프라이트로 직접 생성
        const bubble = this.physics.add.sprite(startX, startY, null);

        // 시각적 설정
        bubble.setDisplaySize(60, 40);
        bubble.setTint(0xff6b6b); // 빨간색으로 보이게

        // 물리 바디 기본 설정 체크 및 수정
        console.log(`물리 바디 상태:`);
        if (bubble.body) {
          console.log(`- body 존재: YES`);
          console.log(`- 초기 속도: (${bubble.body.velocity.x}, ${bubble.body.velocity.y})`);
          console.log(`- 중력 영향: ${bubble.body.gravity.y}`);
          console.log(`- 이동 가능: ${bubble.body.moves}`);

          // 중력 비활성화 (말풍선이 떨어지지 않게)
          bubble.body.setGravityY(0);

          // 이돔 가능하게 설정
          bubble.body.moves = true;

          console.log(`중력 비활성화 완료`);
        } else {
          console.error(`물리 바디가 없음!`);
        }

        console.log(`말풍선 생성 완료 - 위치: (${bubble.x}, ${bubble.y})`);
        console.log(`물리 바디 존재: ${bubble.body ? 'YES' : 'NO'}`);

        // 페이즈별 색상 (스프라이트이므로 setTint 사용)
        switch (this.gameState.currentPhase) {
          case 1:
            bubble.setTint(0xff6b6b);
            break;
          case 2:
            bubble.setTint(0xff0000);
            break;
          case 3:
            bubble.setTint(0x95a5a6);
            break;
        }

        // 텍스트 추가
        const text = this.add.text(bubble.x, bubble.y, pattern.text, {
          fontSize: '12px',
          fill: '#ffffff',
          fontFamily: 'Arial',
          align: 'center'
        }).setOrigin(0.5);

        bubble.speechText = text;
        bubble.attackPattern = pattern;

        // 궤적 시스템 설정 - 그룹 모든 말풍선이 같은 궤적 사용
        const distance = Phaser.Math.Distance.Between(startX, startY, initialPlayerPos.x, initialPlayerPos.y);
        
        // 화면 밖으로 나가는 목표 지점 설정 (플레이어 위치를 지나 더 멀리)
        const direction = { 
          x: initialPlayerPos.x - startX, 
          y: initialPlayerPos.y - startY 
        };
        const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        const normalizedDir = { 
          x: direction.x / length, 
          y: direction.y / length 
        };
        
        // 화면 밖으로 나가는 최종 목표점 (추가 거리 400px)
        const finalTargetX = initialPlayerPos.x + normalizedDir.x * 400;
        const finalTargetY = initialPlayerPos.y + normalizedDir.y * 400;
        const finalDistance = Phaser.Math.Distance.Between(startX, startY, finalTargetX, finalTargetY);
        
        bubble.trajectory = this.initTrajectoryData(groupTrajectoryType, startX, startY, finalTargetX, finalTargetY, finalDistance, pattern.speed);
        bubble.startTime = this.time.now;
        
        console.log(`궤적 타입: ${groupTrajectoryType}, 최종 거리: ${finalDistance.toFixed(2)}`);

        // 그룹에 추가
        this.kingAttacks.add(bubble);
        console.log(`그룹에 추가 완료. 현재 그룹 크기: ${this.kingAttacks.children.size}`);

        // 소멸 타이머 - 더 긴 시간 설정 (화면 밖으로 나가도록)
        this.time.delayedCall(8000, () => {
          if (bubble && bubble.active) {
            console.log(`말풍선 ${i + 1} 자동 소멸`);
            if (bubble.speechText) bubble.speechText.destroy();
            bubble.destroy();
          }
        });

        console.log(`말풍선 ${i + 1} 설정 완료`);
      });
    }
  }

  hitPlayer(player, bubble) {
    console.log('=== 플래이어 피격 처리 ===');
    console.log(`피격 체크: isDodging=${this.playerState.isDodging}, isParrying=${this.playerState.isParrying}`);

    if (this.playerState.isDodging) {
      console.log('회피 중이므로 피격 무시');
      return;
    }

    // 패링 체크
    if (this.playerState.isParrying) {
      console.log('패링 상태! 패링 성공 처리');
      this.parrySuccess(bubble);
      return;
    }

    // 플래이어 피격
    console.log('플래이어 피격 처리 시작');
    this.gameState.playerHealth--;
    this.gameState.combo = 0;

    // 피격 효과
    this.player.setTint(0xff0000);
    this.cameras.main.shake(200, 0.01);

    const hitEffect = this.add.circle(this.player.x, this.player.y, 30, 0xff0000, 0.5);
    this.tweens.add({
      targets: hitEffect,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => hitEffect.destroy()
    });

    this.time.delayedCall(200, () => {
      this.player.setTint(0x3498db);
    });

    // 말풍선 제거
    if (bubble.speechText) bubble.speechText.destroy();
    bubble.destroy();

    console.log(`플래이어 피격 완료! 남은 체력: ${this.gameState.playerHealth}`);
  }

  parrySuccess(bubble) {
    this.gameState.combo++;

    console.log(`패링 성공! 콤보: ${this.gameState.combo}`);

    // 패링 성공 시 반짝임 효과
    const parryFlash = this.add.circle(this.player.x, this.player.y, 40, 0xf1c40f, 0.7);
    this.tweens.add({
      targets: parryFlash,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 400,
      onComplete: () => parryFlash.destroy()
    });

    // 패링된 말풍선을 플레이어 공격으로 변환
    const parryBubble = this.physics.add.sprite(bubble.x, bubble.y, null);
    parryBubble.setCircle(35); // 충돌 백터 설정
    parryBubble.body.setSize(70, 70); // 충돌 영역
    parryBubble.setDisplaySize(bubble.displayWidth * 1.2, bubble.displayHeight * 1.2);
    parryBubble.setTint(0xf1c40f); // 황금색으로 변경

    // 속도 벡터 계산 (왕을 향해)
    const distance = Phaser.Math.Distance.Between(parryBubble.x, parryBubble.y, this.king.x, this.king.y);
    const duration = (distance / 400) * 1000;

    const velocityX = (this.king.x - parryBubble.x) / duration * 1000;
    const velocityY = (this.king.y - parryBubble.y) / duration * 1000;

    parryBubble.setVelocity(velocityX, velocityY);

    // 플레이어 공격 그룹에 추가
    this.playerAttacks.add(parryBubble);

    // 기존 왕의 공격 말풍선 제거
    if (bubble.speechText) bubble.speechText.destroy();
    bubble.destroy();

    // 패링 성공 효과
    const perfectText = this.add.text(this.player.x, this.player.y - 50, 'Perfect!', {
      fontSize: '20px',
      fill: '#f1c40f',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: perfectText,
      y: perfectText.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => perfectText.destroy()
    });

    // 콤보에 따른 체력 회복
    if (this.gameState.combo % 5 === 0 && this.gameState.playerHealth < 3) {
      this.gameState.playerHealth++;

      const healText = this.add.text(this.player.x, this.player.y - 30, '+♥', {
        fontSize: '24px',
        fill: '#e74c3c',
        fontFamily: 'Arial'
      }).setOrigin(0.5);

      this.tweens.add({
        targets: healText,
        y: healText.y - 30,
        alpha: 0,
        duration: 1000,
        onComplete: () => healText.destroy()
      });
    }
  }

  // 왕이 플레이어 공격에 피격당했을 때
  hitKing(king, parryBubble) {
    this.gameState.kingHealth -= 10;

    // 왕 피격 효과 - 화면 흔들림 추가
    this.cameras.main.shake(150, 0.005);
    this.king.setTint(0xffffff);

    // 왕 피격 파티클 효과
    const kingHitEffect = this.add.circle(this.king.x, this.king.y, 25, 0xffffff, 0.8);
    this.tweens.add({
      targets: kingHitEffect,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 400,
      onComplete: () => kingHitEffect.destroy()
    });

    this.time.delayedCall(100, () => {
      this.updateKingColor();
    });

    // 플레이어 공격 말풍선 제거
    parryBubble.destroy();

    console.log(`왕 피격! 남은 체력: ${this.gameState.kingHealth}`);
  }

  // 가장 가까운 왕의 공격 찾기 (회피 방향 결정용)
  findNearestKingAttack() {
    let nearestBubble = null;
    let minDistance = Infinity;

    // 안전하게 그룹 존재 확인
    if (!this.kingAttacks || !this.kingAttacks.children || !this.kingAttacks.children.entries) {
      return null;
    }

    this.kingAttacks.children.entries.forEach(bubble => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        bubble.x, bubble.y
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestBubble = bubble;
      }
    });

    return nearestBubble;
  }

  // 수동 충돌 감지 (물리 시스템이 작동하지 않을 때 백업)
  checkManualCollisions() {
    // 안전하게 그룹 존재 확인
    if (!this.kingAttacks || !this.playerAttacks) return;
    if (!this.kingAttacks.children || !this.playerAttacks.children) return;

    // 플레이어와 왕의 공격 충돌 체크
    if (this.kingAttacks.children.entries) {
      this.kingAttacks.children.entries.forEach(bubble => {
        if (bubble.active) {
          const distance = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            bubble.x, bubble.y
          );

          // 충돼 반경 40픽셀로 설정
          if (distance < 40) {
            console.log('수동 충돼 감지: 플래이어 vs 말풍선');
            this.hitPlayer(this.player, bubble);
          }
        }
      });
    }

    // 왕과 플래이어 공격 충돼 체크
    if (this.playerAttacks.children.entries) {
      this.playerAttacks.children.entries.forEach(bubble => {
        if (bubble.active) {
          const distance = Phaser.Math.Distance.Between(
            this.king.x, this.king.y,
            bubble.x, bubble.y
          );

          if (distance < 40) {
            console.log('수동 충돼 감지: 왕 vs 패링 공격');
            this.hitKing(this.king, bubble);
          }
        }
      });
    }
  }

  checkPhaseTransition() {
    const healthPercent = (this.gameState.kingHealth / 100) * 100;
    let newPhase = this.gameState.currentPhase;

    if (healthPercent <= 20 && this.gameState.currentPhase < 3) {
      newPhase = 3;
    } else if (healthPercent <= 60 && this.gameState.currentPhase < 2) {
      newPhase = 2;
    }

    if (newPhase !== this.gameState.currentPhase) {
      this.gameState.currentPhase = newPhase;
      this.showPhaseTransition(newPhase);
      this.updateKingColor();
    }
  }

  showPhaseTransition(phase) {
    const { width, height } = this.cameras.main;
    let message = '';

    switch (phase) {
      case 2:
        message = '"어? 너는..."';
        break;
      case 3:
        message = '"제발..."';
        break;
    }

    const phaseText = this.add.text(width / 2, height / 2, message, {
      fontSize: '36px',
      fill: '#e74c3c',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      phaseText.destroy();
    });

    console.log(`페이즈 ${phase} 전환!`);
  }

  updateKingColor() {
    switch (this.gameState.currentPhase) {
      case 1:
        this.king.setTint(0xe74c3c);
        break;
      case 2:
        this.king.setTint(0xff0000);
        break;
      case 3:
        this.king.setTint(0x95a5a6);
        break;
    }
  }

  updateUI() {
    // 왕 체력바 업데이트
    const healthPercent = this.gameState.kingHealth / 100;
    const maxWidth = this.cameras.main.width - 40;
    this.kingHealthBar.displayWidth = maxWidth * healthPercent;

    // 어린왕자 체력 하트 업데이트 (캐릭터 위에 표시)
    this.playerHearts.forEach((heart, index) => {
      heart.setPosition(
        this.player.x - 20 + (index * 20),
        this.player.y - 80
      );
      heart.setVisible(index < this.gameState.playerHealth);
    });

    // 콤보 업데이트
    this.comboText.setText(`COMBO: ${this.gameState.combo}`);
  }

  updateSpeechBubbles() {
    // 안전하게 그룹 존재 확인
    if (!this.kingAttacks || !this.playerAttacks) return;
    if (!this.kingAttacks.children || !this.playerAttacks.children) return;

    const currentTime = this.time.now;
    const deltaTime = this.game.loop.delta / 1000; // 초 단위

    // 왕의 공격 업데이트 - 궤적 기반 이동
    if (this.kingAttacks.children.entries) {
      this.kingAttacks.children.entries.forEach(bubble => {
        if (bubble.active && bubble.trajectory) {
          const elapsedTime = (currentTime - bubble.startTime) / 1000; // 초

          const newPosition = this.calculateTrajectoryPosition(bubble, elapsedTime, deltaTime);

          if (newPosition) {
            bubble.setPosition(newPosition.x, newPosition.y);

            // 바닥에 닿거나 화면 밖으로 나가면 말풍선 제거
            if (bubble.y >= this.floorY || 
                bubble.x < -100 || bubble.x > this.cameras.main.width + 100 ||
                bubble.y < -100 || bubble.y > this.cameras.main.height + 100) {
              console.log('말풍선이 바닥에 닿거나 화면 밖으로 나가서 제거됨');
              if (bubble.speechText) bubble.speechText.destroy();
              bubble.destroy();
              return;
            }

            // 텍스트 위치 업데이트
            if (bubble.speechText) {
              bubble.speechText.setPosition(bubble.x, bubble.y);
            }
          }
        }
      });
    }

    // 플레이어 패링 공격 업데이트
    if (this.playerAttacks.children.entries) {
      this.playerAttacks.children.entries.forEach(bubble => {
        if (bubble.active) {
          // 왕을 향해 직접 이동
          const deltaX = (this.king.x - bubble.x) * 0.05;
          const deltaY = (this.king.y - bubble.y) * 0.05;

          bubble.x += deltaX;
          bubble.y += deltaY;
        }
      });
    }
  }

  checkGameEnd() {
    if (this.gameState.playerHealth <= 0) {
      this.gameOver();
    } else if (this.gameState.kingHealth <= 0) {
      this.victory();
    }
  }

  gameOver() {
    this.gameState.isGameOver = true;
    console.log('게임 오버');

    const { width, height } = this.cameras.main;
    this.add.text(width / 2, height / 2, 'GAME OVER', {
      fontSize: '48px',
      fill: '#e74c3c',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      this.shutdown();
      this.scene.start('MainMenuScene');
    });
  }

  victory() {
    this.gameState.isGameOver = true;
    console.log('승리!');

    const { width, height } = this.cameras.main;

    // 엔딩 연출
    const endingText1 = this.add.text(width / 2, height / 2 - 50,
      '"진정한 왕은 명령하지 않아요"', {
      fontSize: '24px',
      fill: '#3498db',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.time.delayedCall(3000, () => {
      const endingText2 = this.add.text(width / 2, height / 2,
        '"고맙구나, 어린 친구야"', {
        fontSize: '24px',
        fill: '#95a5a6',
        fontFamily: 'Arial'
      }).setOrigin(0.5);

      this.time.delayedCall(3000, () => {
        this.add.text(width / 2, height / 2 + 50, 'VICTORY!', {
          fontSize: '48px',
          fill: '#f1c40f',
          fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
          this.shutdown();
          this.scene.start('MainMenuScene');
        });
      });
    });
  }


  // 궤적 타입 선택 함수
  selectTrajectoryType(pattern, phase, index) {
    // 페이즈별 궤적 패턴 우선도
    const phaseTrajectories = {
      1: ['linear', 'curved', 'arc'],
      2: ['curved', 'zigzag', 'arc', 'linear'],
      3: ['linear', 'curved'] // 3페이즈는 느리고 단순하게
    };

    // 공격 패턴별 특별한 궤적
    const patternTrajectories = {
      'down': ['arc', 'curved'],
      'up': ['arc', 'linear'],
      'center': ['linear', 'curved'],
      'multi': ['zigzag', 'curved'],
      'random': ['zigzag', 'arc'],
      'weak': ['linear'],
      'plea': ['curved']
    };

    const availableTrajectories = phaseTrajectories[phase] || ['linear'];
    const patternSpecific = patternTrajectories[pattern.direction];

    // 패턴별 특수 궤적이 있으면 그 중에서 선택
    if (patternSpecific) {
      const filtered = patternSpecific.filter(t => availableTrajectories.includes(t));
      if (filtered.length > 0) {
        return Phaser.Utils.Array.GetRandom(filtered);
      }
    }

    // 인덱스 기반 다양성 추가
    const indexBased = availableTrajectories[index % availableTrajectories.length];

    return indexBased || 'linear';
  }

  // 궤적 데이터 초기화 함수
  initTrajectoryData(trajectoryType, startX, startY, targetX, targetY, distance, speed) {
    const trajectory = {
      type: trajectoryType,
      startX: startX,
      startY: startY,
      targetX: targetX,
      targetY: targetY,
      distance: distance,
      speed: speed,
      duration: distance / speed // 총 이동 시간 (초)
    };

    // 궤적 타입별 추가 데이터
    switch (trajectoryType) {
      case 'curved':
        // 베지어 곡선을 위한 제어점
        trajectory.controlX = startX + (targetX - startX) * 0.5 + Phaser.Math.Between(-100, 100);
        trajectory.controlY = startY + (targetY - startY) * 0.5 + Phaser.Math.Between(-80, 80);
        break;

      case 'arc':
        // 포물선 궤적 - 높이를 적절히 조절하여 플레이어에게 도달
        trajectory.peakHeight = Phaser.Math.Between(30, 60); // 높이 감소
        trajectory.peakTime = 0.5; // 중간 지점에서 최고점
        break;

      case 'zigzag':
        // 지그재그 패턴
        trajectory.zigzagAmplitude = Phaser.Math.Between(30, 60);
        trajectory.zigzagFrequency = Phaser.Math.Between(3, 6);
        break;

      case 'linear':
      default:
        // 직선 이동을 위한 기본 데이터
        break;
    }

    return trajectory;
  }

  // 궤적 위치 계산 함수
  calculateTrajectoryPosition(bubble, elapsedTime, deltaTime) {
    const trajectory = bubble.trajectory;
    const progress = Math.min(elapsedTime / trajectory.duration, 1.0);

    let x, y;

    switch (trajectory.type) {
      case 'curved':
        // 베지어 곡선 (2차)
        const t = progress;
        const t1 = 1 - t;
        x = t1 * t1 * trajectory.startX + 2 * t1 * t * trajectory.controlX + t * t * trajectory.targetX;
        y = t1 * t1 * trajectory.startY + 2 * t1 * t * trajectory.controlY + t * t * trajectory.targetY;
        break;

      case 'arc':
        // 포물선 궤적 - 수정된 공식으로 플레이어 위치를 정확히 통과
        x = trajectory.startX + (trajectory.targetX - trajectory.startX) * progress;
        const baseY = trajectory.startY + (trajectory.targetY - trajectory.startY) * progress;
        // 포물선 공식 수정: 시작점과 끝점을 정확히 통과하도록
        const heightOffset = -trajectory.peakHeight * Math.sin(progress * Math.PI);
        y = baseY + heightOffset;
        break;

      case 'zigzag':
        // 지그재그 패턴
        x = trajectory.startX + (trajectory.targetX - trajectory.startX) * progress;
        const baseZigY = trajectory.startY + (trajectory.targetY - trajectory.startY) * progress;
        const zigzagOffset = Math.sin(progress * Math.PI * trajectory.zigzagFrequency) * trajectory.zigzagAmplitude;
        y = baseZigY + zigzagOffset;
        break;

      case 'linear':
      default:
        // 직선 이동
        x = trajectory.startX + (trajectory.targetX - trajectory.startX) * progress;
        y = trajectory.startY + (trajectory.targetY - trajectory.startY) * progress;
        break;
    }

    return { x: x, y: y };
  }

  // 게임 상태 초기화 함수
  resetGameState() {
    console.log('게임 상태 초기화 시작');

    // 게임 상태 리셋
    this.gameState = {
      playerHealth: 3,
      kingHealth: 100,
      currentPhase: 1,
      combo: 0,
      lastAttackTime: 0,
      gameStartTime: this.time.now,
      isGameOver: false
    };

    // 플레이어 상태 초기화
    this.playerState = {
      isJumping: false,
      isDodging: false,
      isParrying: false,
      lastDodgeTime: 0,
      lastParryTime: 0,
      canJump: true
    };

    // 기존 타이머들 정리
    if (this.attackTimer) {
      this.attackTimer.destroy();
      this.attackTimer = null;
    }

    // 수동 충돌 감지 활성화
    this.manualCollisionCheck = true;

    console.log('게임 상태 초기화 완료');
  }

  // 씬 종료 시 정리 함수
  shutdown() {
    console.log('GameScene 종료 및 정리 시작');

    // 모든 타이머 정리
    if (this.attackTimer) {
      this.attackTimer.destroy();
      this.attackTimer = null;
    }

    // 물리 그룹 정리
    if (this.kingAttacks) {
      this.kingAttacks.clear(true, true);
    }
    if (this.playerAttacks) {
      this.playerAttacks.clear(true, true);
    }

    // 상태 초기화
    this.gameState.isGameOver = true;
    this.manualCollisionCheck = false;

    console.log('GameScene 정리 완료');
  }
}
window.GameScene = GameScene; 