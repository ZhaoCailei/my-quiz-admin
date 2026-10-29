<template>
  <div class="admin-layout">
    <header class="admin-header">Quiz后台管理</header>

    <div class="admin-main">
      <aside class="admin-sidebar">
        <el-menu
          :default-active="activeMenu"
          :default-openeds="['system']"
          class="admin-menu"
          router
        >
          <el-submenu index="system">
            <template slot="title">
              <i class="el-icon-setting"></i>
              <span>系统信息管理</span>
            </template>
            <el-menu-item index="/user">
              <i class="el-icon-user"></i>
              <span slot="title">用户管理</span>
            </el-menu-item>
            <el-menu-item index="/quiz">
              <i class="el-icon-document"></i>
              <span slot="title">题目管理</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </aside>

      <main class="admin-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminLayout',
  computed: {
    activeMenu() {
      return this.$route.path
    }
  }
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: #fff;
  color: #303133;
}

.admin-header {
  height: 74px;
  line-height: 74px;
  padding: 0 32px;
  font-size: 34px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #111;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.admin-main {
  display: flex;
  min-height: calc(100vh - 75px);
}

.admin-sidebar {
  flex: 0 0 220px;
  width: 220px;
  padding-top: 16px;
  background: #fff;
  border-right: 1px solid #f0f0f0;
}

.admin-menu {
  border-right: none;
  background: #fff;
}

.admin-menu ::v-deep .el-submenu__title {
  height: 52px;
  line-height: 52px;
  font-size: 15px;
  color: #606266;
}

.admin-menu ::v-deep .el-submenu__title i {
  margin-right: 10px;
  color: #909399;
}

.admin-menu ::v-deep .el-submenu__title:hover {
  background: #f7faff;
}

.admin-menu ::v-deep .el-menu-item {
  height: 52px;
  line-height: 52px;
  min-width: 0;
  padding-left: 52px !important;
  font-size: 15px;
  color: #606266;
}

.admin-menu ::v-deep .el-menu-item i {
  margin-right: 9px;
  color: inherit;
}

.admin-menu ::v-deep .el-menu-item:hover {
  background: #f5f9ff;
  color: #2f74c0;
}

.admin-menu ::v-deep .el-menu-item.is-active {
  background: #e8f3ff;
  color: #2f74c0;
  font-weight: 600;
}

.admin-content {
  flex: 1;
  min-width: 0;
  padding: 24px 32px 40px;
  background: #fff;
}

@media (max-width: 768px) {
  .admin-header {
    height: 60px;
    line-height: 60px;
    padding: 0 18px;
    font-size: 24px;
  }

  .admin-sidebar {
    flex-basis: 172px;
    width: 172px;
  }

  .admin-content {
    padding: 18px 16px 30px;
  }
}
</style>
