<template>
  <v-dialog v-model="show" width="500">
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        {{ $t('title') }}
      </v-card-title>

      <div class="pa-4 pb-0">
        <v-select v-model="currentWorkspace"
                  :items="this.workspace.list"
                  :item-text="(v) => v.data.properties.name"
                  :label="$t('workspaceSelect')"
                  :no-data-text="$t('noData')"
                  outlined
                  return-object
                  dense
        />
      </div>

      <v-form class="pa-4" @submit.prevent="onCreateWorkspace">
        <v-text-field v-model="workspaceName"
                      :label="$t('workspaceCreateInput')"
                      outlined
                      dense
        />
        <v-btn color="primary" type="submit" :disabled="!workspaceName">
          {{ $t('createBtn') }}
        </v-btn>
      </v-form>

      <v-divider></v-divider>

      <div v-if="currentWorkspace" class="pa-4">
        <v-expansion-panels flat>

          <v-expansion-panel>
            <v-expansion-panel-header>
              Настройки текущего рабочего стола
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-text-field v-model="workspacePropertySnapshot.name" label="Название рабочего стола" />
              <v-text-field v-model="workspacePropertySnapshot.description" label="Описание рабочего стола" />
              <v-checkbox v-model="workspacePropertySnapshot.allowColumnMove" label="Перемещение колонок" class="mt-0" />
              <v-checkbox v-model="workspacePropertySnapshot.allowCardMove" label="Перемещение карточек" class="mt-0" />
              <v-checkbox v-model="workspacePropertySnapshot.allowChangeColumnStyle" label="Изменение стиля колонок" class="mt-0" />
              <v-checkbox v-model="workspacePropertySnapshot.allowChangeCardStyle" label="Изменение стиля карточек" class="mt-0" />
              <v-checkbox v-model="workspacePropertySnapshot.allowChangeCardStatus" class="mt-0" >
                <template #label>
                  Изменение статуса карточек
                  <v-tooltip bottom>
                    <template #activator="{ on }">
                      <span v-on="on" class="text-decoration-underline ml-2">?</span>
                    </template>
                    После изменения статуса на выполенный, поменять статус будет нельзя
                  </v-tooltip>
                </template>
              </v-checkbox>
              <v-btn color="error" width="100%">Удалить рабочий стол</v-btn>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-header>
              Фон рабочего стола
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <div class="mt-4">
                <v-color-picker v-model="workspacePropertySnapshot.backgroundColor" dot-size="13" mode="hexa" width="450" swatches-max-height="178" :hide-mode-switch="true" class="mt-4" />
              </div>
              <div class="mt-4">
                <v-file-input v-if="!workspacePropertySnapshot.backgroundImage.name"
                              :loading="fileLoading"
                              :rules="[validateFileTypes]"
                              label="Фоновое изображение"
                              truncate-length="15"
                              @change="setWorkspaceBackgroundImage"
                />
                <v-btn v-else @click="setWorkspaceBackgroundImage(null)">Удалить изображение</v-btn>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <div v-if="settingsHasChanges" class="flex mt-4">
          <v-btn width="50%" text @click="createWorkspacePropertySnapshot">Отменить</v-btn>
          <v-btn width="50%" color="primary" @click="saveWorkspaceProperties">Применить</v-btn>
        </div>
      </div>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="gray" text @click="hideDialog">
          {{ $t('closeBtn') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { cloneDeep, isEqual } from 'lodash';
import { workspaceInstance } from '@/store/modules/workspace/config';
import { getBase64 } from '@/_utils/file';

export default {
  name: 'TheHeaderDialog',

  i18n: {
    messages: {
      ru: {
        title: 'Рабочий стол',
        workspaceSelect: 'Текущий рабочий стол',
        noData: 'Нет рабочих столов',
        workspaceCreateInput: 'Название нового рабочего стола',
        createBtn: 'Создать',
        closeBtn: 'Закрыть',
      },
      en: {
        title: 'Workspace',
        workspaceSelect: 'Current workspace',
        noData: 'No workspaces',
        workspaceCreateInput: 'Name of the new desktop',
        createBtn: 'Create',
        closeBtn: 'Close',
      },
    },
  },

  data() {
    return {
      show: false,
      workspaceName: '',
      workspacePropertySnapshot: {},
      defaultWorkspaceInstance: workspaceInstance(),
      fileLoading: false,
    };
  },

  computed: {
    ...mapState('workspace', ['workspace']),
    currentWorkspace: {
      get() {
        return this.workspace.list.find((workspace) => workspace.uid === this.workspace.current?.uid);
      },
      set(v) {
        this.setCurrentWorkspace(v);
      },
    },
    settingsHasChanges() {
      return !isEqual(this.workspacePropertySnapshot, this.currentWorkspace?.data?.properties);
    },
  },

  methods: {
    ...mapActions('workspace', ['createWorkspace', 'setCurrentWorkspace', 'changeWorkspace']),

    // dialog
    showDialog() {
      this.show = true;
    },
    hideDialog() {
      this.show = false;
      this.workspaceName = '';
    },
    onCreateWorkspace() {
      this.createWorkspace(this.workspaceName);
    },
    createWorkspacePropertySnapshot() {
      this.workspacePropertySnapshot = cloneDeep(this.currentWorkspace.data.properties);
    },
    validateFileTypes(v) {
      const validTypes = ['image/jpeg', 'image/png'];
      return validTypes.includes(v?.type);
    },
    setWorkspaceBackgroundImage(file) {
      if (file) {
        this.fileLoading = true;
        getBase64(file)
          .then((stringFile) => {
            this.workspacePropertySnapshot.backgroundImage = {
              file: stringFile,
              name: file.name,
            };
          })
          .finally(() => { this.fileLoading = false; });
      } else {
        this.workspacePropertySnapshot.backgroundImage = {
          file: null,
          name: '',
        };
      }
    },
    async saveWorkspaceProperties() {
      await this.changeWorkspace(this.workspacePropertySnapshot);
      this.createWorkspacePropertySnapshot();
    },
  },

  watch: {
    'currentWorkspace.uid': {
      handler() {
        this.createWorkspacePropertySnapshot();
      },
    },
  },
};
</script>

<style scoped>

</style>
