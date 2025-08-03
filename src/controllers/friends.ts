import avatar_img_alray from "../images/alray.jpg?url";
import avatar_img_chenyue from "../images/chenyue.jpg?url";
import avatar_img_laiq from "../images/laiq.jpg?url";
import avatar_img_surfish from "../images/surfish.png?url";
import avatar_img_toby from "../images/toby.jpg?url";
import { Singleton } from "../utils/singleton";

interface Role {
  name: string;
  description: string;
  memory: string;
  avatar: string;
}

export class FriendsManager extends Singleton<FriendsManager>() {
  self: Role = {
    name: "surfish",
    description: "",
    memory: "",
    avatar: avatar_img_surfish,
  };

  friends: Role[] = [
    {
      name: "Alray",
      description: "",
      memory: "",
      avatar: avatar_img_alray,
    },
    {
      name: "Laiq",
      description: "",
      memory: "",
      avatar: avatar_img_laiq,
    },
    {
      name: "Tobylai",
      description: "",
      memory: "",
      avatar: avatar_img_toby,
    },
    {
      name: "ChenYue",
      description: "",
      memory: "",
      avatar: avatar_img_chenyue,
    },
  ];

  selfEl!: HTMLElement;

  avatarEls: HTMLElement[] = [];

  anchor = document.getElementById("friends-board")!;

  unit = "rem";

  size = 7;

  radius = 8;

  createAvatarEl(role: Role) {
    const avatarEl = document.createElement("div");
    avatarEl.className = "avatar";
    avatarEl.style.width = `${this.size}${this.unit}`;
    avatarEl.style.height = `${this.size}${this.unit}`;
    avatarEl.style.position = "absolute";
    avatarEl.style.backgroundImage = `url(${role.avatar})`;
    avatarEl.style.backgroundSize = "cover";
    avatarEl.style.backgroundPosition = "center";
    avatarEl.style.borderRadius = "50%";
    this.anchor.appendChild(avatarEl);
    return avatarEl;
  }

  init() {
    let n = 6; // 空位数量
    let r = 1; // 当前圈数
    let i = 0; // 当前 role 索引
    let all = false;
    const len = this.friends.length;
    while (n > 0) {
      this.avatarEls.push(this.createAvatarEl(this.friends[i]));
      n -= 1;
      i += 1;
      if (i >= len) {
        i = 0;
        all = true;
      }
      if (n <= 0 && !all) {
        r += 1;
        n = r * 6;
      }
    }
    this.selfEl = this.createAvatarEl(this.self);
    this.selfEl.style.transform = `translate(-50%, -50%)`;
    let t = 0;
    let last = Date.now();
    const frame = () => {
      let now = Date.now();
      t += now - last;
      last = now;
      this.render(t);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  render(t: number) {
    // 按照六边形排列，从中间散开
    let n = 6; // 空位数量
    let r = 1; // 当前圈数
    let i = 0; // 当前遍历的索引
    const len = this.avatarEls.length;
    while (i < len) {
      const speed = (r % 2 === 0 ? 1 : -1) * 0.01;
      this.avatarEls[i].style.transform = `
      translate(-50%, -50%)
      rotate(${(360 * n) / (6 * r) + t * speed}deg) 
      translate(${this.radius * r}${this.unit}, 0) 
      rotate(${-((360 * n) / (6 * r) + t * speed)}deg)`;
      n -= 1;
      i += 1;
      if (n <= 0) {
        r += 1;
        n = r * 6;
      }
    }
  }
}
