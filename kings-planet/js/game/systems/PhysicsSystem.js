import { GAME_CONSTANTS } from '../../utils/Constants.js';

export class PhysicsSystem {
  constructor(scene) {
    this.scene = scene;
    this.collisionGroups = {};
    this.colliders = [];
    
    this.setupPhysics();
  }
  
  // 물리 설정
  setupPhysics() {
    // 중력 설정
    this.scene.physics.world.setBounds(0, 0, GAME_CONSTANTS.SCREEN.WIDTH, GAME_CONSTANTS.SCREEN.HEIGHT);
    
    // 바닥 생성
    this.createFloor();
  }
  
  // 바닥 생성
  createFloor() {
    const floorY = GAME_CONSTANTS.SCREEN.FLOOR_Y;
    
    // 시각적 바닥
    this.floor = this.scene.add.rectangle(
      GAME_CONSTANTS.SCREEN.WIDTH / 2, 
      floorY, 
      GAME_CONSTANTS.SCREEN.WIDTH, 
      4, 
      0x95a5a6
    );
    this.floor.setStrokeStyle(1, 0xecf0f1);
    
    // 물리 바닥 (보이지 않음)
    this.physicsFloor = this.scene.add.rectangle(
      GAME_CONSTANTS.SCREEN.WIDTH / 2, 
      floorY, 
      GAME_CONSTANTS.SCREEN.WIDTH, 
      4, 
      0x95a5a6
    );
    this.physicsFloor.setVisible(false);
    this.scene.physics.add.existing(this.physicsFloor, true);
    
    // 바닥 라벨
    this.floorLabel = this.scene.add.text(
      GAME_CONSTANTS.SCREEN.WIDTH / 2, 
      floorY + 15, 
      'BATTLE ARENA', 
      {
        fontSize: '12px',
        fill: '#95a5a6',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5);
  }
  
  // 충돌 그룹 생성
  createCollisionGroup(name) {
    this.collisionGroups[name] = this.scene.physics.add.group();
    return this.collisionGroups[name];
  }
  
  // 충돌 그룹 가져오기
  getCollisionGroup(name) {
    return this.collisionGroups[name];
  }
  
  // 충돌 감지 설정
  addCollider(object1, object2, callback, context) {
    const collider = this.scene.physics.add.collider(object1, object2, callback, null, context);
    this.colliders.push(collider);
    return collider;
  }
  
  // 오버랩 감지 설정
  addOverlap(object1, object2, callback, context) {
    const overlap = this.scene.physics.add.overlap(object1, object2, callback, null, context);
    this.colliders.push(overlap);
    return overlap;
  }
  
  // 충돌 감지 제거
  removeCollider(collider) {
    if (collider) {
      collider.destroy();
      const index = this.colliders.indexOf(collider);
      if (index > -1) {
        this.colliders.splice(index, 1);
      }
    }
  }
  
  // 모든 충돌 감지 제거
  clearColliders() {
    for (const collider of this.colliders) {
      if (collider) {
        collider.destroy();
      }
    }
    this.colliders = [];
  }
  
  // 물리 객체에 중력 적용
  setGravity(object, x = 0, y = 1200) {
    if (object.body) {
      object.body.setGravity(x, y);
    }
  }
  
  // 물리 객체의 속도 설정
  setVelocity(object, x, y) {
    if (object.body) {
      object.body.setVelocity(x, y);
    }
  }
  
  // 물리 객체의 속도 가져오기
  getVelocity(object) {
    if (object.body) {
      return { x: object.body.velocity.x, y: object.body.velocity.y };
    }
    return { x: 0, y: 0 };
  }
  
  // 물리 객체의 위치 설정
  setPosition(object, x, y) {
    if (object.body) {
      object.body.setPosition(x, y);
    } else {
      object.setPosition(x, y);
    }
  }
  
  // 물리 객체의 위치 가져오기
  getPosition(object) {
    if (object.body) {
      return { x: object.body.x, y: object.body.y };
    }
    return { x: object.x, y: object.y };
  }
  
  // 물리 객체 활성화/비활성화
  setPhysicsEnabled(object, enabled) {
    if (object.body) {
      object.body.enable = enabled;
    }
  }
  
  // 물리 객체가 바닥에 닿았는지 확인
  isOnGround(object) {
    if (object.body) {
      return object.body.touching.down;
    }
    return false;
  }
  
  // 두 객체 간의 거리 계산
  getDistance(object1, object2) {
    const pos1 = this.getPosition(object1);
    const pos2 = this.getPosition(object2);
    
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  // 두 객체 간의 각도 계산
  getAngle(object1, object2) {
    const pos1 = this.getPosition(object1);
    const pos2 = this.getPosition(object2);
    
    return Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
  }
  
  // 물리 월드 경계 설정
  setWorldBounds(x, y, width, height) {
    this.scene.physics.world.setBounds(x, y, width, height);
  }
  
  // 물리 디버그 모드 토글
  toggleDebug() {
    this.scene.physics.world.drawDebug = !this.scene.physics.world.drawDebug;
  }
  
  // 물리 디버그 모드 설정
  setDebugEnabled(enabled) {
    this.scene.physics.world.drawDebug = enabled;
  }
  
  // 업데이트
  update(time, delta) {
    // 물리 관련 업데이트가 필요한 경우 여기에 추가
  }
  
  // 파괴
  destroy() {
    this.clearColliders();
    
    if (this.floor) {
      this.floor.destroy();
    }
    
    if (this.physicsFloor) {
      this.physicsFloor.destroy();
    }
    
    if (this.floorLabel) {
      this.floorLabel.destroy();
    }
    
    for (const group of Object.values(this.collisionGroups)) {
      if (group) {
        group.destroy();
      }
    }
    
    this.collisionGroups = {};
  }
} 